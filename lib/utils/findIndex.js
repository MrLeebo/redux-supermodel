export default function findIndex (arr, fn = x => x) {
  if (!arr) {
    return -1
  }

  let i = -1
  while (++i < arr.length) {
    if (fn(arr[i])) {
      return i
    }
  }

  return -1
}
