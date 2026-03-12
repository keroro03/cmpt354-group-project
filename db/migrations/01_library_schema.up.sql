CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'copy_status') THEN
    CREATE TYPE copy_status AS ENUM ('AVAILABLE', 'LOANED', 'LOST', 'DAMAGED', 'MAINTENANCE');
  END IF;
END $$;

-- branch
CREATE TABLE IF NOT EXISTS branch (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- branch_id
  branch_name TEXT NOT NULL,
  location TEXT NOT NULL
);

-- member
CREATE TABLE IF NOT EXISTS member (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- member_id
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  address TEXT
);

-- Member - Branch (handle) many-to-many
CREATE TABLE IF NOT EXISTS member_branch (
  member_id UUID NOT NULL REFERENCES member(id) ON DELETE RESTRICT,
  branch_id UUID NOT NULL REFERENCES branch(id) ON DELETE RESTRICT,
  PRIMARY KEY (member_id, branch_id)
);

-- staff
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- staff_id
  branch_id UUID NOT NULL REFERENCES branch(id) ON DELETE RESTRICT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL
);

-- inherites from staff
CREATE TABLE IF NOT EXISTS librarian (
  staff_id UUID PRIMARY KEY REFERENCES staff(id) ON DELETE RESTRICT,
  certification TEXT
);

CREATE TABLE IF NOT EXISTS assistant_manager (
  staff_id UUID PRIMARY KEY REFERENCES staff(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS manager (
  staff_id UUID PRIMARY KEY REFERENCES staff(id) ON DELETE RESTRICT,
  office_id TEXT
);

-- author
CREATE TABLE IF NOT EXISTS author (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- author_id
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  biography TEXT
);

-- book
CREATE TABLE IF NOT EXISTS book (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- book_id
  title TEXT NOT NULL,
  isbn TEXT,
  publish_year INT,
  publisher TEXT,
  genre TEXT
);

-- book author own many-to-many
CREATE TABLE IF NOT EXISTS book_author (
  book_id UUID NOT NULL REFERENCES book(id) ON DELETE RESTRICT,
  author_id UUID NOT NULL REFERENCES author(id) ON DELETE RESTRICT,
  PRIMARY KEY (book_id, author_id)
);

-- book_copies (weak entity)
CREATE TABLE IF NOT EXISTS book_copies (
  book_id UUID NOT NULL REFERENCES book(id) ON DELETE CASCADE, -- book_id
  copied_book_id INT NOT NULL, -- copied_book_id (Partial Key)
  branch_id UUID NOT NULL REFERENCES branch(id) ON DELETE RESTRICT,
  status copy_status NOT NULL DEFAULT 'AVAILABLE',
  PRIMARY KEY (book_id, copied_book_id),
  CHECK (copied_book_id > 0)
);

-- borrow
CREATE TABLE IF NOT EXISTS borrow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- borrow_id
  member_id UUID NOT NULL REFERENCES member(id) ON DELETE CASCADE,
  book_id UUID NOT NULL,
  copied_book_id INT NOT NULL,
  loan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  return_date DATE,
  CONSTRAINT fk_borrow_book_copy
    FOREIGN KEY (book_id, copied_book_id)
    REFERENCES book_copies(book_id, copied_book_id)
    ON DELETE CASCADE,
  CHECK (due_date >= loan_date),
  CHECK (return_date IS NULL OR return_date >= loan_date)
);

-- indexes for proposal queries
CREATE INDEX IF NOT EXISTS idx_book_title ON book(title);
CREATE INDEX IF NOT EXISTS idx_book_genre ON book(genre);
CREATE INDEX IF NOT EXISTS idx_book_author_author_id ON book_author(author_id);
CREATE INDEX IF NOT EXISTS idx_borrow_member_return ON borrow(member_id, return_date);
CREATE INDEX IF NOT EXISTS idx_borrow_bookcopy_return ON borrow(book_id, copied_book_id, return_date);
CREATE INDEX IF NOT EXISTS idx_book_copies_book_status ON book_copies(book_id, status);

-- unique constraints for entity identity
CREATE UNIQUE INDEX IF NOT EXISTS ux_member_email_lower ON member(LOWER(email));
CREATE UNIQUE INDEX IF NOT EXISTS ux_staff_email_lower ON staff(LOWER(email));
CREATE UNIQUE INDEX IF NOT EXISTS ux_book_isbn_not_null ON book(isbn) WHERE isbn IS NOT NULL;

-- staff disjoint specialization (partial + disjoint)
CREATE OR REPLACE FUNCTION enforce_staff_disjoint() RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'librarian' THEN
    IF EXISTS (SELECT 1 FROM assistant_manager am WHERE am.staff_id = NEW.staff_id)
       OR EXISTS (SELECT 1 FROM manager m WHERE m.staff_id = NEW.staff_id) THEN
      RAISE EXCEPTION 'Staff % already belongs to another subtype', NEW.staff_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'assistant_manager' THEN
    IF EXISTS (SELECT 1 FROM librarian l WHERE l.staff_id = NEW.staff_id)
       OR EXISTS (SELECT 1 FROM manager m WHERE m.staff_id = NEW.staff_id) THEN
      RAISE EXCEPTION 'Staff % already belongs to another subtype', NEW.staff_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'manager' THEN
    IF EXISTS (SELECT 1 FROM librarian l WHERE l.staff_id = NEW.staff_id)
       OR EXISTS (SELECT 1 FROM assistant_manager am WHERE am.staff_id = NEW.staff_id) THEN
      RAISE EXCEPTION 'Staff % already belongs to another subtype', NEW.staff_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_librarian_disjoint
BEFORE INSERT OR UPDATE OF staff_id ON librarian
FOR EACH ROW EXECUTE FUNCTION enforce_staff_disjoint();

CREATE TRIGGER trg_assistant_manager_disjoint
BEFORE INSERT OR UPDATE OF staff_id ON assistant_manager
FOR EACH ROW EXECUTE FUNCTION enforce_staff_disjoint();

CREATE TRIGGER trg_manager_disjoint
BEFORE INSERT OR UPDATE OF staff_id ON manager
FOR EACH ROW EXECUTE FUNCTION enforce_staff_disjoint();

-- borrow rule + max 5 active loans + copy availability checks
CREATE OR REPLACE FUNCTION enforce_borrow_rules() RETURNS TRIGGER AS $$
DECLARE
  active_count INT;
  copy_current_status copy_status;
BEGIN
  IF NEW.return_date IS NULL THEN
    SELECT COUNT(*) INTO active_count
    FROM borrow b
    WHERE b.member_id = NEW.member_id
      AND b.return_date IS NULL
      AND (TG_OP <> 'UPDATE' OR b.id <> NEW.id);

    IF active_count >= 5 THEN
      RAISE EXCEPTION 'Member % already has 5 active borrows', NEW.member_id;
    END IF;

    SELECT bc.status INTO copy_current_status
    FROM book_copies bc
    WHERE bc.book_id = NEW.book_id AND bc.copied_book_id = NEW.copied_book_id;

    IF copy_current_status IS DISTINCT FROM 'AVAILABLE' THEN
      RAISE EXCEPTION 'Book copy (%, %) is not available for checkout', NEW.book_id, NEW.copied_book_id;
    END IF;

    IF EXISTS (
      SELECT 1
      FROM borrow b
      WHERE b.book_id = NEW.book_id
        AND b.copied_book_id = NEW.copied_book_id
        AND b.return_date IS NULL
        AND (TG_OP <> 'UPDATE' OR b.id <> NEW.id)
    ) THEN
      RAISE EXCEPTION 'Book copy (%, %) already has an active borrow', NEW.book_id, NEW.copied_book_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_borrow_rules
BEFORE INSERT OR UPDATE OF member_id, book_id, copied_book_id, return_date ON borrow
FOR EACH ROW EXECUTE FUNCTION enforce_borrow_rules();

-- keep BookCopy.status synchronized with checkout/return
CREATE OR REPLACE FUNCTION sync_copy_status_from_borrow() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.return_date IS NULL THEN
      UPDATE book_copies
      SET status = 'LOANED'
      WHERE book_id = NEW.book_id AND copied_book_id = NEW.copied_book_id;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.return_date IS NULL AND NEW.return_date IS NOT NULL THEN
      UPDATE book_copies
      SET status = 'AVAILABLE'
      WHERE book_id = NEW.book_id AND copied_book_id = NEW.copied_book_id;
    ELSIF OLD.return_date IS NOT NULL AND NEW.return_date IS NULL THEN
      UPDATE book_copies
      SET status = 'LOANED'
      WHERE book_id = NEW.book_id AND copied_book_id = NEW.copied_book_id;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_borrow_sync_copy_status
AFTER INSERT OR UPDATE OF return_date ON borrow
FOR EACH ROW EXECUTE FUNCTION sync_copy_status_from_borrow();

-- prevent deleting member with active borrows; allow delete after returns
CREATE OR REPLACE FUNCTION prevent_member_delete_with_active_borrow() RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM borrow b
    WHERE b.member_id = OLD.id
      AND b.return_date IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot delete member % with active borrowed books', OLD.id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_member_delete_active_borrow
BEFORE DELETE ON member
FOR EACH ROW EXECUTE FUNCTION prevent_member_delete_with_active_borrow();
