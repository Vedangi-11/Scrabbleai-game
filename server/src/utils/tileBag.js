export const STANDARD_BAG = (() => {
  const distribution = {
    A:9,B:2,C:2,D:4,E:12,F:2,G:3,
    H:2,I:9,J:1,K:1,L:4,M:2,
    N:6,O:8,P:2,Q:1,R:6,
    S:4,T:6,U:4,V:2,W:2,X:1,Y:2,Z:1
  };
  const bag = [];
  for (const [letter, count] of Object.entries(distribution)) {
    for (let i=0;i<count;i++) bag.push(letter);
  }
  bag.push("_");
  bag.push("_");
  return bag;
})();

export function shuffleBag(bag) {
  const copy = [...bag];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function drawTiles(bag, count=7) {
  const drawn = [];
  const newBag = [...bag];
  for (let i=0; i<count && newBag.length>0; i++) {
    drawn.push(newBag.pop());
  }
  return { drawn, bag: newBag };
}

export const shuffle = (array) => array.sort(() => Math.random() - 0.5);