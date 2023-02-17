export const replaceEmpties = (obj: Object, field: keyof Object, replace: String): any =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (Array.isArray(value) && value.every((v) => v === undefined || v === null)) {
        return [key, replace];
      }
      if (value === undefined || value === null) {
        return [key, replace];
      }
      if (Array.isArray(value)) return [key, value.map((e: any) => e[field]).join(', ')];

      return [key, value];
    }),
  );
