type FromPersistence<T> = {
  fromPersistence(raw: any): T;
};

type Entity = {
  getProps(): Record<string, any>;
};

export function toDomain<T>(raw: any, EntityClass: FromPersistence<T>): T {
  return EntityClass.fromPersistence(raw);
}

export function toPersistence(entity: Entity): Record<string, any> {
  const { email, ...rest } = entity.getProps();

  return {
    ...rest,
    email: typeof email?.getValue === 'function' ? email.getValue() : email
  };
}
