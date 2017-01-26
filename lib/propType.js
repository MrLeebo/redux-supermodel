import { _metaTag } from './mapResourceStateToProps'

function chainablePropType (predicate) {
  const propType = (props, propName, componentName) => {
    if (props[propName] == null) return
    return predicate(props, propName, componentName)
  }

  propType.isRequired = (props, propName, componentName) => {
    if (props[propName] == null) {
      return new Error(`Required prop \`${propName}\` was not specified in \`${componentName}\`.`)
    }

    return predicate(props, propName, componentName)
  }

  return propType
}

function isValidResource (resource) {
  return resource && resource[_metaTag]
}

function resourcePropType (props, propName, componentName) {
  if (!isValidResource(props[propName])) {
    return new Error(`Invalid prop \`${propName}\` supplied to \`${componentName}\`, expected a \`redux-supermodel\` resource.`)
  }

  return null
}

export default chainablePropType(resourcePropType)
