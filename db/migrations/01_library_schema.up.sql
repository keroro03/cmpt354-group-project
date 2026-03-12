-- branch
CREATE TABLE IF NOT EXISTS branch (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- branch id
  branch_name TEXT NOT NULL,
  location TEXT NOT NULL
);

-- member
CREATE TABLE IF NOT EXISTS library_member (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- member_id
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  address TEXT
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
  genre TEXT,
);

-- book_copies
CREATE TABLE IF NOT EXISTS book_copies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- copied_book_id
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  status copy_status NOT NULL DEFAULT 'AVAILABLE',
);