export const randomArray = (array: Array<any>) => array[Math.floor(Math.random() * array.length)];

export const datetimeConverter = (timestamp: Date) => {
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return {
    date: `${day}/${month}/${year}`,
    time: `${hour}/${minute}/${second}`,
    datetime: `${day}/${month}/${year} ${hour}:${minute}:${second}`,
  };
};

export const timeDiff = (timestamp: Date): String => {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = now.getTime() - date.getTime();
  const diffDays = Math.floor(diff / (1000 * 3600 * 24));
  const diffHours = Math.floor(diff / (1000 * 3600));
  const diffMinutes = Math.floor(diff / (1000 * 60));
  const diffSeconds = Math.floor(diff / 1000);
  if (diffDays > 0) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  if (diffHours > 0) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffMinutes > 0) return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  if (diffSeconds > 0) return `${diffSeconds} ${diffSeconds === 1 ? 'second' : 'seconds'} ago`;
  return 'Just now';
};

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
