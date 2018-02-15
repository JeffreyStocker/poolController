class Stack {
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
    this.head.next.prev = null;
    this.head.next = null;
    this.head = next;

    this.length--;
    return node.val;
  }
  remove (position) {
    var node = this.head;
    for (var i = 0; i < position; i++) {
      node = node.next;
    }
  }
}

// var stack = new Stack();

// stack.push (5);
// // stack.push (3)
// // console.log (stack.pop())
// stack.unshift(1);
// console.log(stack.shift());
// console.log(stack);