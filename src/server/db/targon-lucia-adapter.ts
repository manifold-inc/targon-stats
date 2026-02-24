import { eq, lte } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import type { PlanetScaleDatabase } from "drizzle-orm/planetscale-serverless";
import type { Adapter, DatabaseSession, DatabaseUser } from "lucia";

import type { TargonSession, TargonUser } from "./targon-schema";

export class TargonLuciaAdapter implements Adapter {
  private db: PlanetScaleDatabase;
  private sessionTable: typeof TargonSession;
  private userTable: typeof TargonUser;

  constructor(
    db: PlanetScaleDatabase,
    sessionTable: typeof TargonSession,
    userTable: typeof TargonUser
  ) {
    this.db = db;
    this.sessionTable = sessionTable;
    this.userTable = userTable;
  }

  public async getSessionAndUser(
    sessionId: string
  ): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> {
    const result = await this.db
      .select({
        user: this.userTable,
        session: this.sessionTable,
      })
      .from(this.sessionTable)
      .innerJoin(
        this.userTable,
        eq(this.sessionTable.userId, this.userTable.id)
      )
      .where(eq(this.sessionTable.id, sessionId));
    if (result.length !== 1) return [null, null];
    const row = result[0];
    if (!row) return [null, null];
    return [
      transformIntoDatabaseSession(
        row.session as InferSelectModel<typeof TargonSession>
      ),
      transformIntoDatabaseUser(
        row.user as InferSelectModel<typeof TargonUser>
      ),
    ];
  }

  public async deleteSession(sessionId: string): Promise<void> {
    await this.db
      .delete(this.sessionTable)
      .where(eq(this.sessionTable.id, sessionId));
  }

  public async deleteUserSessions(userId: number): Promise<void> {
    await this.db
      .delete(this.sessionTable)
      .where(eq(this.sessionTable.userId, userId));
  }

  public async getUserSessions(userId: number): Promise<DatabaseSession[]> {
    const result = await this.db
      .select()
      .from(this.sessionTable)
      .where(eq(this.sessionTable.userId, userId));
    return result.map((val) =>
      transformIntoDatabaseSession(
        val as InferSelectModel<typeof TargonSession>
      )
    );
  }

  public async setSession(session: DatabaseSession): Promise<void> {
    await this.db.insert(this.sessionTable).values({
      id: session.id,
      userId: session.userId,
      expiresAt: session.expiresAt,
      ...session.attributes,
    });
  }

  public async updateSessionExpiration(
    sessionId: string,
    expiresAt: Date
  ): Promise<void> {
    await this.db
      .update(this.sessionTable)
      .set({ expiresAt })
      .where(eq(this.sessionTable.id, sessionId));
  }

  public async deleteExpiredSessions(): Promise<void> {
    await this.db
      .delete(this.sessionTable)
      .where(lte(this.sessionTable.expiresAt, new Date()));
  }
}

function transformIntoDatabaseSession(raw: {
  id: string;
  userId: number;
  expiresAt: Date;
  [key: string]: unknown;
}): DatabaseSession {
  const { id, userId, expiresAt, ...attributes } = raw;
  return {
    userId,
    id,
    expiresAt,
    attributes,
  };
}

function transformIntoDatabaseUser(raw: {
  id: number;
  [key: string]: unknown;
}): DatabaseUser {
  const { id, ...attributes } = raw;
  return {
    id,
    attributes,
  };
}
