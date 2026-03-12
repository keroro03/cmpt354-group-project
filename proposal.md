CMPT354 Project Proposal

Domain: Multi-branch library management system

Aspects:
Book management
Books, authors
Multiple copies of a book
People management
staffs
library members
borrowers
Loan management
borrowing and returning book copies
track due dates and book status

Application Specification (Functionalities):
Book features:
search books by title
search books by author
search books by genre
view availability
View popular books

Borrowing features:
Borrow a book copy
return a book copy

Management features:
add/remove book copies
add/remove library members

Application Goal:

- Fines and book overdue tracking (remove later if not needed)
- Search for books by title, author, genre
- Check out / Return book
- Track popular books
- Track Staff and Employees

Platform: MySQL+ Python (Flask)

Database Model ideas: Library Management System

Entities
Book
book_id (PK)
title
isbn
publish_year
publisher
genre
author (FK, references author.id)
language
total_copies
available_copies

Library Member
member_id (PK)
name (first_name, last_name)
email
address
phone_number

Staff
staff_id (PK)
name (first_name, last_name)
email
role

Staff Subtypes (Generalization/Specialization)
Librarian (certification)
Assistant Manager
Manager (office_id)

Branch
branch_id (PK)
branch_name
location
Author
author_id (PK)
name (first_name, last_name)
date_of_birth
bio/desc

Weak Entity
BookCopy (Cannot exist without a book) Identifying Relationship: Borrowing,
Note: composite key is formed by Book’s primary key + BookCopy’s partial key.
copied_book_id (Partial Key)
status (available, borrowed, damaged)

Relationship
Belongs(N:1) Identifying Relationship - Each book(concept) has many book copies, but each book can only have one concept; each book copy must have a concept.

Borrows(N:1) - Members can borrow many books; each book copy can only have one borrower; (attributes: member_id, loan_date, return_date, due_date)

Own(M:N) - An author can own multiple books, and a book can have multiple authors. Also, every book must have at least one author.

Handle(M:N) - A branch can handle many library members, and a member can be handled by multiple branches.

Supply(M:N) - A branch can supply many books, and a book can be in multiple branches. Every branch must have books and every book be supplied from at least one branch.

WorkFor(N:1) - Each branch can have many staff members, each member works for one branch.

Queries
Selection query
Search books by title/author / book_id (must return a distinct list of Books, and not copies)
Show all available copies of a book (list all BookCopy records where BookCopy.status = ‘available’)
Show all overdue loans of a member (list all records in the Borrows relationship where due_date < current_date, such that return_date is NULL)

Aggregation query
Count the number of books borrowed per member

Update queries
Check out the book (Constraints: Check if the specific BookCopy.status = ‘available’, then check that the borrower has not exceeded the maximum number of allowed books borrowed at once, if constraints pass, update BookCopy.status = ‘borrowed’)
Return book (Update BookCopy.status = ‘available’)

Deletion queries
Delete a Library Member (Cannot delete library members that have any active borrowed books to their name)
Delete a Book (Cannot delete a book that is being borrowed by a member, valid deletes ensure cascading deletes across all book copies)

Division query
Borrowers who have borrowed all the books in the category (Compare the set of book_ids in a specific genre against the set of book_ids present in the Borrows records for a specific member_id)

Nested query
Find a book that has never been borrowed (Search for a book_id that does not exist in the Borrows history)
Find the book that has been borrowed the most (Find the book_id that has the highest number of Borrows history)

Documentation (Data Model Summary)

Weak Entity and Its Dependency
A Book(Strong Entity) is an “Idea” or a concept, supplying all the necessary information for each book. BookCopy(WeakEntity) is dependent on this strong entity, as it forms the composite key (Book.PrimaryKey + BookCopy.PartialKey). We utilize CASCADING DELETE to ensure that if a specific title is to be taken off the shelf, all physical copies of that book are to be taken off as well.

Referential Integrity (Deletion Constraints)
All entries in BookCopy.due_date, loan_date, and return_date are NULL values until they are borrowed.
Library Members who have overdue books or have borrowed more than 5 books at once are no longer allowed to borrow books until constraints are satisfied.

Library Members are not allowed to be removed from the database until they have returned all borrowed books, and all active borrow records for the member must be cleared.

Generalization/Specialization
The Staff hierarchy is modelled using Partial Specialization and Disjoint constraints, ensuring that not every record in the entity needs to belong to one of the subtypes. A staff member cannot be a Manager as well as an Assistant Manager.
