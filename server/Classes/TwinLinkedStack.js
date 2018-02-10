class TwinLinkedStack {
  constructor(data) {
    if (!data) {
      this.head = null;
      this.tail = null;
      this.length = 0;
    } else {
      this.head = this.tail = this.item(data);
      this.length = 1;
    }
  }
  item (data) {
    var context = this;
    var remove = TwinLinkedStack.prototype.remove();
    return {
      val: data,
      prev: null,
      next: null
    };
  }

  push (data) {
    var node = this.item(data);
    if (!this.head) {
      this.head = node;
    }
    if (!this.tail) {
    } else {
      node.prev = this.tail;
      this.tail.next = node;
    }
    this.tail = node;
    this.length++;
  }

  pop () {
    var node;
    if (this.length === 0) {
      return undefined;
    }
    node = this.tail;
    if (this.length === 1) {
      this.head = null;
      this.tail = null;
    } else {
      this.tail = node.prev;
      this.tail.next = null;
    }
    this.length--;
    return node.val;
  }

  unshift (data) {
    var node = this.item (data);
    if (this.length === 0) {
      this.tail = node;
      this.head = node;
    } else {
      this.head.prev = node;
      node.next = this.head;
      this.head = node;
    }
    this.length++;
  }

  shift () {
    var node, next;

    if (this.length === 0) {
      return undefined;
    }
    node = this.head;
    next = this.head.next;
    if (this.tail === node) {
      this.tail = null;
    }
    if (this.next) {
      this.head.next.prev = null;
    }
    this.head.next = null;
    this.head = next;

    this.length--;
    return node.val;
  }

  findAtIndex (index) {
    if (!index || typeof index !== 'number') { return undefined; }
    var node = this.head;
    if (index > this.length - 1 || !node) { return undefined; }
    for (var i = 0; i < index; i++) {
      node = node.next;
    }
    return node.val;
  }

  removeAtIndex (index) {
    var next, prev, node;
    if (!index || typeof index !== 'number') { return undefined; }
    node = this.head;
    if (index > this.length - 1 || !node) { return undefined; }
    for (var i = 0; i < index; i++) {
      node = node.next;
    }
    return this.remove.call(node);
  }

  remove(value) {
    var node;
    node = this.head;
    if (value === undefined) { return undefined; }
    for (var i = 0; i < this.length; i++) {
      if (node.val === value) {
        if (i === 0) {
          return this.shift();
        } else if (i === this.length - 1) {
          return this.pop();
        } else {
          node.prev.next = node.next;
          !!node.next ? node.next.prev = node.prev : null;
          this.length--;
          return node.val;
        }
      }
      node = node.next;
    }
    return -1;
  }

  find(value, callback) {
    var node;
    node = this.head;
    if (value === undefined) { return undefined; }
    for (var i = 0; i < this.length; i++) {
      if (node.val === value) {
        if (typeof callback === 'function') {
          return callback(val, i, node);
        } else {
          return i;
        }
      }
      node = node.next;
    }
    if (typeof callback === 'function') {
      return callback(undefined, -1, undefined);
    } else {
      return -1;
    }
  }


  toArray() {
    var output = [];
    var node = this.head;
    if (this.head === null) { return []; }

    for (var i = 0; i < this.length; i++) {
      output.push(node.val);
      node = node.next;
    }
    return output;
  }


  forEach (callback) {
    var node = this.head;
    if (callback === undefined || node === null) { return; }

    for (var i = 0; i < this.length; i++) {
      callback (node.val, i, node);
      node = node.next;
    }
  }

  isEmpty () {
    if (this.length === 0) {
      return true;
    }
    return false;
  }

  clear() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  contains (value) {
    if (value === undefined) {
      return undefined;
    }
    if (this.find(value) !== -1) {
      return true;
    }
    return false;
  }
  peak () {
    if (this.head === null) {
      return;
    }
    return this.head.val;
  }

}
module.exports = TwinLinkedStack;

//test//

// var stack = new TwinLinkedStack();

// stack.push (5);
// // stack.push (3)
// // console.log (stack.pop())
// stack.unshift(1);
// stack.shift();
// stack.shift();
// stack.push(3);
// // stack.pop();
// stack.unshift(10);
// stack.unshift(333);
// // stack.pop()
// // stack.pop()

// // console.log(stack.shift());
// console.log(stack.toArray());
// console.log('find', stack.remove(333));
// console.log('find', stack.remove(10));
// console.log('find', stack.remove(3));
// console.log('find', stack.remove(3));
// console.log(stack.toArray());
