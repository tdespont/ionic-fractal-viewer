import { Gradient } from "./gradient";
import { LinkedList } from "./linkedList";

export class FractalParameters
 {
    x0: any;
    x1: any;
    y0: any;
    y1: any;

    init: boolean = true;
    gradient: Gradient;
    histo: LinkedList;
    
    constructor() {
    }

}