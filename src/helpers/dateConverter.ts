export function datetimeConverter(timestamp: Date) {
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
}
