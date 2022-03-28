class Chain {

  constructor(value) {
    this.value = value
    this.matchPredicate = null
    this.predicates = []
  }

  static of(value){
    return new Chain(value)
  }

  match(predicate){
    this.matchPredicate = predicate
    return this
  }

  orElse(predicate){
    this.predicates.push(predicate)
    return this
  }

  get(){
    const responseOfFirstPredicate = this.matchPredicate(this.value)
    if(responseOfFirstPredicate) return responseOfFirstPredicate

    for(const predicate of this.predicates){
      const result = predicate(this.value)
      if(!!result) return result
    }
  }
}

module.exports = Chain
