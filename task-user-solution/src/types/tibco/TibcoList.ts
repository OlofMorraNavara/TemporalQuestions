/**
 * Implementation of interface described at
 * https://docs.tibco.com/pub/amx-bpm/4.3.3/doc/html/Business-Data-Services-Developer-Guide/list-methods.htm?tocpath=Business%20Data%20Services%20Developer%20Guide%7CBusiness%20Data%20Scripting%7COther%20Supported%20Methods%7C_____1
 */
export class TibcoList<T> {
  private _items: T[] = [];
  public _internalType = this.constructor.name;

  public constructor(items: T[] = []) {
    this._items = items;
  }

  public add(item: T): boolean;
  public add(index: number, item: T): void;
  public add(itemOrIndex: T | number, item?: T): boolean | void {
    if (typeof itemOrIndex == "number" && item != undefined) {
      this._items.splice(itemOrIndex, 0, item);
      return;
    } else if (typeof itemOrIndex != "number") {
      this._items.push(itemOrIndex);
      return true;
    } else {
      return;
    }
  }

  public clear(): void {
    this._items = [];
  }

  public contains(item: T): boolean {
    return this._items.some((i) => i == item);
  }

  public get(index: number): T {
    if (index < 0 || index >= this._items.length) {
      throw new Error("List index out of bounds");
    }

    return this._items[index];
  }

  public isEmpty(): boolean {
    return this._items.length == 0;
  }

  public listIterator(): IterableIterator<T> {
    return this._items[Symbol.iterator]();
  }

  /**
   * Removes the specified element from the list, returns removed element.
   * - Not clear if this should throw an error if the index is out of bounds.
   * - Not clear if this should return removed element.
   *
   * @param index
   */
  public remove(index: number): T;
  public remove(item: T): boolean;
  public remove(indexOrItem: number | T): T | boolean {
    if (typeof indexOrItem == "number") {
      if (indexOrItem < 0 || indexOrItem >= this._items.length) {
        throw new Error("List index out of bounds");
      }

      const removedItem = this._items[indexOrItem];

      this._items.splice(indexOrItem, 1);
      return removedItem;
    } else if (typeof indexOrItem != "number") {
      const index = this._items.indexOf(indexOrItem);
      if (index == -1) {
        return false;
      }

      this._items.splice(index, 1);
      return true;
    } else {
      return false;
    }
  }

  /**
   * Replaces the element at the specified position in this list with the specified element, returns the set element.
   *
   * @param index
   * @param item
   */
  public set(index: number, item: T): T {
    if (index < 0 || index >= this._items.length) {
      throw new Error("List index out of bounds");
    }

    this._items[index] = item;
    return this._items[index];
  }

  public size(): number {
    return this._items.length;
  }

  public subList(fromIndex: number, toIndex: number): TibcoList<T> {
    const sublist = new TibcoList<T>();

    for (let i = fromIndex; i < toIndex; i++) {
      sublist.add(this._items[i]);
    }

    return sublist;
  }

  /**
   * Adds all the elements in the specified collection to this list.
   *
   * @param c Not certain if this is correctly typed, type given in documentation is 'Collection'
   */
  public addAll(c: Iterable<T>): boolean {
    let result = true;
    for (const item of c) {
      result = result && this.add(item);
    }
    return result;
  }
}
