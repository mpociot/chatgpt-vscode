create the prisma schema for the use case
===

To create the Prisma schema for the property administration system use case, you can define the data models and their relationships in the schema file. Here's an example Prisma schema for this use case:

```prisma
// schema.prisma

model Property {
  id        Int      @id @default(autoincrement())
  name      String
  address   String
  units     Unit[]
}

model Unit {
  id        Int      @id @default(autoincrement())
  number    Int
  area      Float
  property  Property @relation(fields: [propertyId], references: [id])
  propertyId Int
  tenants   Tenant[]
}

model Tenant {
  id        Int      @id @default(autoincrement())
  firstName String
  lastName  String
  email     String   @unique
  phone     String?
  unit      Unit     @relation(fields: [unitId], references: [id])
  unitId    Int
  leases    Lease[]
}

model Lease {
  id        Int      @id @default(autoincrement())
  startDate DateTime
  endDate   DateTime
  rent      Float
  unit      Unit     @relation(fields: [unitId], references: [id])
  unitId    Int
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  tenantId  Int
}
```

In the above schema, we have defined four models: Property, Unit, Tenant, and Lease. Each model represents a different entity in the property administration system.

The Property model represents a property with its name, address, and a list of units associated with it.

The Unit model represents an individual unit within a property, with its number, area, and a reference to the parent Property model.

The Tenant model represents a tenant with their first name, last name, email, phone number, and the unit they are associated with.

The Lease model represents a lease agreement with its start date, end date, rent amount, and references to the associated Unit and Tenant.

The relationships between the models are defined using the @relation attribute. For example, the Property model has a one-to-many relationship with the Unit model, and the Unit model has a one-to-many relationship with the Tenant model.

You can use this Prisma schema to generate database migrations, create the database tables, and interact with the database using the Prisma Client.

===
Please create a more detailed schema for the property administration system which includes models to support all user flows in the use case
===

Certainly! Here's an expanded schema for the property administration system that includes additional models to support various user flows:

```prisma
// schema.prisma

model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  password  String
  firstName String
  lastName  String
  role      Role
}

model Role {
  id   Int    @id @default(autoincrement())
  name String @unique
  users User[]
}

model Property {
  id        Int      @id @default(autoincrement())
  name      String
  address   String
  units     Unit[]
}

model Unit {
  id        Int       @id @default(autoincrement())
  number    Int
  area      Float
  property  Property  @relation(fields: [propertyId], references: [id])
  propertyId Int
  tenants   Tenant[]
  leases    Lease[]
}

model Tenant {
  id        Int       @id @default(autoincrement())
  firstName String
  lastName  String
  email     String    @unique
  phone     String?
  unit      Unit      @relation(fields: [unitId], references: [id])
  unitId    Int
  leases    Lease[]
}

model Lease {
  id        Int       @id @default(autoincrement())
  startDate DateTime
  endDate   DateTime
  rent      Float
  unit      Unit      @relation(fields: [unitId], references: [id])
  unitId    Int
  tenant    Tenant    @relation(fields: [tenantId], references: [id])
  tenantId  Int
  payments  Payment[]
}

model Payment {
  id        Int       @id @default(autoincrement())
  amount    Float
  date      DateTime
  lease     Lease     @relation(fields: [leaseId], references: [id])
  leaseId   Int
}

model MaintenanceRequest {
  id        Int       @id @default(autoincrement())
  title     String
  description String
  status    MaintenanceRequestStatus
  unit      Unit      @relation(fields: [unitId], references: [id])
  unitId    Int
}

enum MaintenanceRequestStatus {
  OPEN
  IN_PROGRESS
  COMPLETED
}

model Announcement {
  id        Int       @id @default(autoincrement())
  title     String
  content   String
  date      DateTime  @default(now())
  property  Property  @relation(fields: [propertyId], references: [id])
  propertyId Int
}

model Document {
  id        Int       @id @default(autoincrement())
  name      String
  url       String
  property  Property  @relation(fields: [propertyId], references: [id])
  propertyId Int
}
```

In this expanded schema:

The User model represents system users and includes fields for email, password, first name, last name, and a reference to the user's role.
The Role model represents user roles and can be used to define different access levels or permissions.
The MaintenanceRequest model represents maintenance requests for specific units and includes fields for title, description, status, and a reference to the associated unit.
The Announcement model represents announcements that can be made for a specific property and includes fields for title, content, date, and a reference to the associated property.
The Document model represents documents associated with a property and includes fields for name, URL, and a reference to the associated property.
These additional models support functionalities such as user management, maintenance requests, announcements, and document management, enhancing the overall functionality of the property administration system.