let game;

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);
  game = new FisherGame();
}

function draw() {
  handleInteraction();

  background(220);
  game.draw();
  game.world.lake.fish.filter(f => !f.caught).forEach(f => f.move());
  game.world.lake.fish.filter(f => !f.caught).forEach(f => {
    if (f.bite(game.world.fisher.pole.geom.hookPt)) {
      game.score++;
      f.setCaught();
    }
  });
  const numFishCaught = game.world.lake.fish.filter(f => f.caught).length;
  if (numFishCaught == FisherGame.numFish) {
    game.initializeWorld();
  }
}

function drawLineSequence(points) {
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    line(a.x, a.y, b.x, b.y);
  }
}

function handleInteraction() {
  if (keyIsPressed) {
    if (key === 'a') {
      game.world.fisher.move(-1);
    }

    if (key === 'd') {
      game.world.fisher.move(1);
    }

    if (key === 'w') {
      game.world.fisher.pole.moveLine(game, -1);
    }

    if (key === 's') {
      game.world.fisher.pole.moveLine(game, 1);
    }
  }
}

function clampToRange(val, low, high) {
  if (val < low) {
    return low;
  }
  if (val > high) {
    return high;
  }
  return val;
}

function debugText(x, y, msg) {
  push();
  noStroke();
  fill('white');
  text(msg, x, y);
  pop();
}

function generateSkyColors() {
  // make some color palettes
  const tuscon = ["rgb(255, 0, 0)", "rgb(128, 255, 128)", "rgb(40, 40, 128)"];
  const paris = ["#a25333", "#dbcd95", "#a2c3a6", "#5b2e30", "#848666"];
  const earth = ["rgb(0, 82, 147)", "rgb(18, 146, 211)", "rgb(142, 191, 224)", "rgb(206, 216, 228)"];
  const sunset = ["#441404", "#9c2b04", "#f4bf07", "#ec962d"];

  // add them to a master list
  const palettes = [tuscon, paris, earth, sunset];

  // pick a random one of those & return it
  return random(palettes);
}

/** Gives the drawingContext.transform in a mathjs Matrix. This lets you use any
 * mathjs function that takes a matrix. */
function getMathJsTransform() {
  const t = drawingContext.getTransform();
  const m = math.matrixFromColumns([t.a, t.b, 0], [t.c, t.d, 0], [t.e, t.f, 1]);
  return m;
}

/**
 * Translate a list of local coordinates (according to
 * `drawingContext.getTransform()`) to a list of points that are translated into
 * world coordinates. The list of points are {x, y} objects.
 */
function toWorldCoordinates({ points, debug = false, transform }) {
  const t = transform || getMathJsTransform();

  // Note: if the pixel density is anything other than one, we have to 
  // adjust all points by scaling them by the current device pixel density.
  // So you'll see down below how I'm multiplying x and y by ss.
  const ss = pixelDensity(); // it seems the transform will sometimes account for this? wtf am I am supposed to do?
  const inv = math.inv(t);
  const ret = points.map(p => {
    const [x, y] = math.multiply(inv, [p.x * ss, p.y * ss, -1]);
    return { x, y };
  });
  if (debug) {
    console.log(`${frameCount} local points:`, points);
    console.log(`${frameCount} transform:`, t);
    console.log(`${frameCount} inverse:`, inv);
    console.log(`${frameCount} world points:`, ret);
  }
  return ret;
}

const ptToArray = ({ x, y }) => [x, y];

const arrayToPt = ([x, y]) => { x, y };

const ptPairToSegment = ([start, end]) => ({
  start, end
})

// Gives 'intersection' data regarding the given point and a line defined
// by the start/end points. The return values are:
// 
// x: x-coordinate of the nearest point on the line to point pt
// y: like x, but for y
// u: the parametric value of how far along (x,y) is on the line.
// offset: the unsigned distance from the point to the line
// sign: 1 or -1 depending if pt is on the right or left of the line.
const getIntersectionPointAndLineParametric = ({ pt, start, end }) => {
  // see http://paulbourke.net/geometry/pointlineplane/
  const numerator =
    (pt.x - start.x) * (end.x - start.x) + (pt.y - start.y) * (end.y - start.y);
  const deltaVec = math.subtract(ptToArray(end), ptToArray(start));
  const deltaVecMag = math.norm(deltaVec);
  const denominator = deltaVecMag * deltaVecMag;
  const u = numerator / denominator;
  const ix = {
    x: start.x + u * (end.x - start.x),
    y: start.y + u * (end.y - start.y),
  };
  const ixToPt = math.subtract(pt, ix);
  const offset = math.norm(ixToPt);
  // now need the sign of that offset
  const startToEnd = math.subtract(end, start);
  const startToPt = math.subtract(pt, start);
  const det = math.det([ptToArray(startToEnd), ptToArray(startToPt)]);
  const sign = det < 0 ? -1 : 1;
  return { ...ix, u, offset, sign };
};

// Intersect a line with all piecewise linear line segments formed by the
// given point sequence. It returns early when it finds a hit. If there is no
// intersection it returns null.
const intersectLineSegmentWithSequence = ({ line, sequence, debug, closedSequence }) => {
  if (debug) {
    console.log("intersectLineSegmentWithSequence:", line, sequence);
  }
  const limit = closedSequence ? sequence.length : sequence.length - 1;
  for (let i = 0; i < limit; i++) {
    const segment = [sequence[i], sequence[(i + 1) % sequence.length]];
    const maybeIx = intersectLineSegments({
      lineA: ptPairToSegment(line),
      lineB: ptPairToSegment(segment),
    });
    if (maybeIx) {
      return maybeIx;
    }
  }
  return null;
}

// line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
// Determine the intersection point of two line segments
// Return FALSE if the lines don't intersect
const intersectLineSegments = ({ lineA, lineB }) => {
  const x1 = lineA.start.x;
  const x2 = lineA.end.x;
  const x3 = lineB.start.x;
  const x4 = lineB.end.x;
  const y1 = lineA.start.y;
  const y2 = lineA.end.y;
  const y3 = lineB.start.y;
  const y4 = lineB.end.y;

  // Check if none of the lines are of length 0
  if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
    return false
  }

  denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))

  // Lines are parallel
  if (denominator === 0) {
    return false
  }

  let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
  let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator

  // is the intersection along the segments
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
    return false
  }

  // Return a object with the x and y coordinates of the intersection
  let x = x1 + ua * (x2 - x1)
  let y = y1 + ua * (y2 - y1)

  return { x, y }
}

/** 
 * Given three points ({x: number, y:number}) this will either return a circle
 * center point, or null if the circle center can't be computed.
 **/
function getCircleCenter(a, b, c) {
  let A = b.x - a.x;
  let B = b.y - a.y;
  let C = c.x - a.x;
  let D = c.y - a.y;

  let E = A * (a.x + b.x) + B * (a.y + b.y);
  let F = C * (a.x + c.x) + D * (a.y + c.y);

  let G = 2 * (A * (c.y - b.y) - B * (c.x - b.x));
  if (G == 0.0)
    return null; // a, b, c seem to be be collinear

  let x = (D * E - B * F) / G;
  let y = (A * F - C * E) / G;
  return ({ x, y });
}

function distBetweenPoints(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Invokes a callback function with no arguments n times. */
function repeat(n, callback) {
  [...Array(n)].forEach(callback);
}

function getPointsOnCircle({ center, startAngle, endAngle, numPoints, radius }) {
  const delta = (endAngle - startAngle) / (numPoints + 1);
  const { x, y } = center;
  const ret = [];
  for (let i = 1; i <= numPoints; i++) {
    const θ = startAngle + (i * delta);
    const dx = radius * Math.cos(θ);
    const dy = radius * Math.sin(θ);
    ret.push({
      x: x + dx,
      y: y + dy,
    })
  }
  return ret;
}

function getRandomIntInRange(low, high) {

}