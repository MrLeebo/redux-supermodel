export default function defaultTransform (state, previousState, isFulfilled, meta) {
  return isFulfilled ? state : previousState
}
