type Point = { x: number; y: number; z: number };

type Tile = {
  centerPoint: Point;
  boundary: Point[];
  faces: {
    centroid: Point;
    points: Point[];
  }[];
};

export default class Hexasphere {
  constructor(radius: number, subDivisions: number, tileWidth: number);

  tiles: Tile[];
}
