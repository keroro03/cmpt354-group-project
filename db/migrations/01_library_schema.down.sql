DROP TRIGGER IF EXISTS trg_member_delete_active_borrow ON member;
DROP TRIGGER IF EXISTS trg_borrow_sync_copy_status ON borrow;
DROP TRIGGER IF EXISTS trg_borrow_rules ON borrow;
DROP TRIGGER IF EXISTS trg_manager_disjoint ON manager;
DROP TRIGGER IF EXISTS trg_assistant_manager_disjoint ON assistant_manager;
DROP TRIGGER IF EXISTS trg_librarian_disjoint ON librarian;

DROP FUNCTION IF EXISTS prevent_member_delete_with_active_borrow();
DROP FUNCTION IF EXISTS sync_copy_status_from_borrow();
DROP FUNCTION IF EXISTS enforce_borrow_rules();
DROP FUNCTION IF EXISTS enforce_staff_disjoint();

DROP TABLE IF EXISTS borrow;
DROP TABLE IF EXISTS book_copies;
DROP TABLE IF EXISTS book_author;
DROP TABLE IF EXISTS book;
DROP TABLE IF EXISTS author;
DROP TABLE IF EXISTS manager;
DROP TABLE IF EXISTS assistant_manager;
DROP TABLE IF EXISTS librarian;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS member_branch;
DROP TABLE IF EXISTS member;
DROP TABLE IF EXISTS branch;

DROP TYPE IF EXISTS copy_status;
