import { BufferAttribute, BufferGeometry, SphereGeometry, Triangle, Vector3 } from 'three';
import Hexasphere from '@/../lib/hexasphere.js';
import { pairwise } from '@/utils';

// https://en.wikipedia.org/wiki/Goldberg_polyhedron

/*
      pos.push(
        b,a,d,
        c,d,a,
      );
      // prettier-ignore
      uv.push( // wall UVs
        F,1, 0,1, F,0,
        0,0, F,0, 0,1, 
      );

*/

export class Polyhedron {
  data: Hexasphere;

  readonly tiles: Tile[];

  constructor(subDivisions: number) {
    this.data = new Hexasphere(1, subDivisions, 1);
    this.tiles = this.data.tiles.map((t) => new Tile(t));
  }
}

class Tile {
  readonly type: 'pentagon' | 'hexagon';
  readonly center: Vector3;
  readonly boundary: Vector3[];
  readonly id: number;

  /**
   * Original tile boundaries may have inconsistent order (hexasphere.js returns them like that
   * if a large number of subdivisions is specified). We want them to wind in the same direction, always.
   */
  private static orderBoundary(boundary: Hexasphere['tiles'][number]['boundary']): Vector3[] {
    const b = boundary.map((b) => new Vector3(b.x, b.y, b.z));
    const o = new Vector3(0, 0, 0);
    const t = new Triangle(b[0], b[1], b[2]);
    const flip = t.getNormal(o).dot(b[0]) < 0;
    return flip ? b.reverse() : b;
  }

  /**
   * Resizes the tile boundary using the specified ratio, making sure it maintains its original center.
   */
  private resizeBoundary(boundary: Vector3[], ratio: number): Vector3[] {
    if (ratio <= 0) throw new Error('Boundary resize ration must be greater than zero');
    const c = this.center;
    return boundary.map((v) => {
      const diff = v.clone().sub(c);
      diff.multiply(new Vector3().addScalar(ratio));
      return diff.add(c);
    });
  }

  private bevelBoundary(boundary: Vector3[], bevelRatio = 0.05): Vector3[] {
    // return boundary;
    const withBevel: Vector3[] = [];
    const n = boundary.length;

    for (let i = 0; i < n; i++) {
      const current = boundary[i];
      const next = boundary[(i + 1) % n];
      const prev = boundary[(i - 1 + n) % n];

      const currentToNext = next.clone().sub(current);
      const currentToPrev = prev.clone().sub(current);

      // endpoints of prev & next segments, offset slightly to create a beveled facet:
      const startAt = current.clone().sub(currentToNext.clone().multiplyScalar(bevelRatio));
      const endAt = current.clone().sub(currentToPrev.clone().multiplyScalar(bevelRatio));

      withBevel.push(startAt, endAt);
    }

    return withBevel;
  }

  /**
   * Calculates a new boundary that is closer to/further away from the origin.
   * It is smaller/larger than the original one: every boundary point is collinear
   * to the respecive point in the original boundary and the origin.
   *
   * (Think a pyramid, where the origin is the tip, the original tile boundary is a frustum,
   * and the offset boundary is another frustum.)
   */
  private offsetBoundary(boundary: Vector3[], offset: number): Vector3[] {
    const b = boundary.map((v) => {
      return v.clone().multiplyScalar(offset);
    });
    return b;
  }

  constructor(tile: Hexasphere['tiles'][number]) {
    if (tile.boundary.length === 5) {
      this.type = 'pentagon';
    } else if (tile.boundary.length === 6) {
      this.type = 'hexagon';
    } else {
      throw new Error('Invalid tile geometry. Expected a hexagon or pentagon.');
    }
    this.center = new Vector3(tile.centerPoint.x, tile.centerPoint.y, tile.centerPoint.z);
    this.boundary = Tile.orderBoundary(tile.boundary);
    this.id = Math.floor(Math.random() * 10_000_000);
  }

  createSphere(): BufferGeometry {
    const geo = new SphereGeometry(0.003);
    geo.translate(...this.center.toArray());
    return geo;
  }

  /**
   * Connects boundary "rings" together by creating 2 triangular faces
   * between respective point pairs in each consecutive ring.
   */
  private static createSides(boundaries: Vector3[][]): Vector3[] {
    const vertices: Vector3[] = [];

    pairwise(boundaries)
      .slice(0, -1)
      .forEach(([bottom, top]) => {
        const bSegs = pairwise(bottom);
        const tSegs = pairwise(top);

        tSegs.forEach((segmentTop, i) => {
          const segmentBottom = bSegs[i];
          const [a, b] = segmentTop;
          const [c, d] = segmentBottom;

          // prettier-ignore
          vertices.push(
          b,a,d,
          c,d,a,
        );
        });
      });

    return vertices;
  }

  private static closeBoundary(boundary: Vector3[], mode: 'cw' | 'ccw' = 'cw'): Vector3[] {
    const vertices: Vector3[] = [];
    const c = boundary[0];
    pairwise(boundary).forEach(([a, b]) => {
      if (mode === 'cw') {
        vertices.push(a, b, c);
      } else {
        vertices.push(c, b, a);
      }
    });
    return vertices;
  }

  createColumn(height: number, withCap = false): BufferGeometry | null {
    height = 1 + height * 0.3;
    const sizeRatio = 0.9;

    const vertices: number[] = [];

    if (withCap) {
      const bottom = this.resizeBoundary(this.bevelBoundary(this.boundary), sizeRatio);
      const top = this.offsetBoundary(bottom, height);
      const bottom_TEMP = this.resizeBoundary(this.bevelBoundary(this.boundary), 0.85);
      const top_TEMP = this.offsetBoundary(bottom_TEMP, height + 0.001);
      const cap = Tile.closeBoundary(top_TEMP).flatMap((v) => v.toArray());
      vertices.push(...cap);
      const rings = [bottom, top, top_TEMP];
      const sides = Tile.createSides(rings).flatMap((v) => v.toArray());
      vertices.push(...cap, ...sides);
    } else {
      const bottom = this.resizeBoundary(this.bevelBoundary(this.boundary), sizeRatio);
      const top = this.offsetBoundary(bottom, height);
      const rings = [bottom, top];
      const sides = Tile.createSides(rings).flatMap((v) => v.toArray());
      vertices.push(...sides);
    }

    const tileIds = vertices.map(() => this.id);

    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
    geo.setAttribute('tile-id', new BufferAttribute(new Float32Array(tileIds), 3));
    return geo;
  }

  createCap(height: number): BufferGeometry | null {
    height = 1 + height * 0.3;

    const sizeRatio = 0.93;
    const atHeight = height;
    const bevelHeight = 0.0005;
    const capHeight = 0.005;

    const base = this.resizeBoundary(this.bevelBoundary(this.boundary), sizeRatio);
    const reduced = this.resizeBoundary(this.bevelBoundary(this.boundary), 0.85);
    const rings = [
      this.offsetBoundary(base, atHeight),
      this.offsetBoundary(base, atHeight + capHeight - bevelHeight),
      this.offsetBoundary(reduced, atHeight + capHeight),
    ];

    const sides = Tile.createSides(rings);
    const bottom = Tile.closeBoundary(rings[0], 'ccw');
    const top = Tile.closeBoundary(rings[2]);

    const vertices = [...sides, ...bottom, ...top].flatMap((v) => v.toArray());

    const tileIds = vertices.map(() => this.id);

    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
    geo.setAttribute('tile-id', new BufferAttribute(new Float32Array(tileIds), 3));
    return geo;
  }
}
