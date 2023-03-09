// loadsh- cloneDeep()
const _ = require('loadsh')
const obj1 = {
  a: 1,
  b: { f: { g: 1 } },
  c: [1, 2, 3],
  d: Date(),
  e: RegExp(),
  f: function ref () { return 2 },
  g: null,
  h: undefined
}
const obj2 = _.cloneDeep(obj1)
console.log(obj1.b.f === obj2.b.f)
console.log(obj2)

// jquery.extend()
// const $1 = require('jquery')
// const j1 = {
//   a: 1,
//   b: { a: { b: { c: 1 } } },
//   c: [1, 2, 3]
// }
// const j2 = $1.extend(true, {}, j1)
// console.log('j2', j2)

// json stringify()
// const bh2 = JSON.parse(JSON.stringify(obj1))
// console.log('bh2', bh2)
/** ******递归深克隆*************/
function deepClone (obj, hash = new WeakMap()) {
  if (obj === null) return obj // null,undefined 不克隆
  if (obj instanceof Date) return new Date(obj) // 处理js自带特殊对象
  if (obj instanceof RegExp) return new RegExp(obj)
  if (typeof obj !== 'object') return obj
  if (hash.get(obj)) return hash.get(obj)
  const cloneObj = new obj.constructor()
  hash.set(obj, cloneObj)

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloneObj[key] = deepClone(obj[key], hash)
    }
  }
  return cloneObj
}
const obj3 = deepClone(obj1)
console.log('obj3', obj3)
// deepClone
function deepCopy(obj) {
  const result = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object') {
        result[key] = deepCopy(obj[key])
      } else {
        result[key] = obj[key];
      }
    }
  }
  return result;
}
const obj4 = deepCopy([1, 2, 3, [4, [5]]])
const obj5 = deepCopy({ a: 2, b: 3, c: Date(), d: null, f: undefined })
console.log('obj4', obj4)
console.log('obj5', obj5)
