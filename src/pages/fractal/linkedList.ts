export class LinkedList
 {
    private nextNode: LinkedList;
    private previousNode: LinkedList;

    private value: any;

    constructor(value: any, previousNode: LinkedList) {
        this.value = value;
        if (previousNode) {
            this.previousNode = previousNode;
            this.previousNode.nextNode = this;
        }
    }

    public getValue() {
        return this.value;
    }

    public rewind() {
        if (this.previousNode) {
            return this.previousNode;
        }
        return this;
    }

    public forward() {
        if (this.nextNode) {
            return this.nextNode;
        }
        return this;
    }
}