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
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- staff_id
  branch_id UUID NOT NULL REFERENCES branch(id) ON DELETE RESTRICT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL
);

-- inherites from staff
CREATE TABLE librarian (
  staff_id UUID PRIMARY KEY REFERENCES staff(id) ON DELETE RESTRICT,
  certification TEXT
);

CREATE TABLE assistant_manager (
  staff_id UUID PRIMARY KEY REFERENCES staff(id) ON DELETE RESTRICT
);

CREATE TABLE manager (
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

-- book_copies
CREATE TABLE IF NOT EXISTS book_copies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- copied_book_id
  book_id UUID NOT NULL REFERENCES book(id) ON DELETE RESTRICT,
  branch_id UUID NOT NULL REFERENCES branch(id) ON DELETE RESTRICT,
  status copy_status NOT NULL DEFAULT 'AVAILABLE'
);

-- borrow
CREATE TABLE IF NOT EXISTS borrow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- borrow_id
  member_id UUID NOT NULL REFERENCES member(id) ON DELETE RESTRICT,
  book_copy_id UUID NOT NULL REFERENCES book_copies(id) ON DELETE RESTRICT,
  loan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  return_date DATE
);