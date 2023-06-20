Please create a set of repository (data query and command) classes that can be used to operate on the Prisma based data model 
ChatGPT
Certainly! Here's an example of repository classes that can be used to operate on the Prisma-based data model:

```typescript
// userRepository.ts

import { PrismaClient, User } from '@prisma/client';

export class UserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createUser(data: User): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async getUserById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | null> {
    return this.prisma.user.update({ where: { id }, data });
  }

  async deleteUser(id: number): Promise<User | null> {
    return this.prisma.user.delete({ where: { id } });
  }
}
```

```ts
// propertyRepository.ts

import { PrismaClient, Property } from '@prisma/client';

export class PropertyRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createProperty(data: Property): Promise<Property> {
    return this.prisma.property.create({ data });
  }

  async getPropertyById(id: number): Promise<Property | null> {
    return this.prisma.property.findUnique({ where: { id } });
  }

  async updateProperty(id: number, data: Partial<Property>): Promise<Property | null> {
    return this.prisma.property.update({ where: { id }, data });
  }

  async deleteProperty(id: number): Promise<Property | null> {
    return this.prisma.property.delete({ where: { id } });
  }
}
```

These are just examples for the User and Property models. You can create similar repository classes for other models in your data model. These repository classes encapsulate the data operations using Prisma's query and mutation methods. You can use these classes to perform CRUD operations on the corresponding entities in your Prisma-based data model.

Please make sure to install the required dependencies (@prisma/client and prisma) and configure Prisma properly in your project before using these repository classes.