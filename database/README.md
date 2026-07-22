# Digital Banking Platform - Database Layer

This directory contains the SQL scripts and ORM schemas to set up the Digital Banking relational database.

## Schema Order of Execution

To configure the PostgreSQL database, execute the scripts in the following order:

1. `enums.sql` — Sets up custom database types.
2. `banking-schema.sql` — Creates the tables.
3. `constraints.sql` — Sets up foreign keys, checks, and referential constraints.
4. `indexes.sql` — Creates search performance optimization indexes.
5. `seed-data.sql` — Seeds default roles, administrative logins, and sample customer profiles.

## Entity Relationship Overview

The schema supports fully auditable retailable and commercial banking scenarios in 3NF:
- **Roles & Users**: System access governance for Customers, Admins, and Developers.
- **Customers & Profiles**: Detailed KYC records and occupation data.
- **Accounts & Transactions**: Relational double-entry transfer recording with unique transaction references.
- **Cards & Limits**: Cards bound to bank accounts with customized spending controls.
- **Loans**: Loan application, approval state tracking, and documentation metadata.
- **Audit Logs**: Comprehensive tracking of critical security events (logins, card locks, transfers).
