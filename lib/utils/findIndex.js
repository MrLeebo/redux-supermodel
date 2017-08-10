const identity = x => x
export default function findIndex (arr, fn = identity) {
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
