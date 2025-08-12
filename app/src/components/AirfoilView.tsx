import * as d3 from "d3";
import { interpolateViridis } from "d3-scale-chromatic";
import { SimResponse, SimParams } from "../lib/api";
type Props = { data: SimResponse | null; params: SimParams };
export default function AirfoilView({ data, params }: Props){
  if(!data) return <div className="empty">Run a simulation to visualize results.</div>;
  const width=900, height=560, pad=32;
  const xExtent:[number,number]=[d3.min(data.xc)??0, d3.max(data.xc)??1];
  const yExtent:[number,number]=[d3.min(data.yc)??-0.2, d3.max(data.yc)??0.2];
  const xScale=d3.scaleLinear().domain([xExtent[0]-0.05, xExtent[1]+0.05]).range([pad,width-pad]);
  const yScale=d3.scaleLinear().domain([yExtent[0]-0.15, yExtent[1]+0.15]).range([height-pad,pad]);
  const cpMin=d3.min(data.cp)??-1, cpMax=d3.max(data.cp)??3;
  const color=d3.scaleSequential().domain([cpMax,cpMin]).interpolator(interpolateViridis);
  const path=d3.line<number>().x((_,i)=>xScale(data.xc[i])).y((_,i)=>yScale(data.yc[i])).curve(d3.curveLinear);
  return (
    <div className="panel">
      <div className="panel-header">Airfoil: {params.shape.toUpperCase()} | AoA {params.aoa_deg.toFixed(1)}° | Cl {data.Cl.toFixed(3)}</div>
      <svg width={width} height={height} className="viz">
        <path d={path(data.xc)} fill="none" stroke="#9aa4" strokeWidth={2}/>
        {data.xc.slice(0,-1).map((_,i)=>(
          <line key={i}
            x1={xScale(data.xc[i])} y1={yScale(data.yc[i])}
            x2={xScale(data.xc[i+1])} y2={yScale(data.yc[i+1])}
            stroke={color(data.cp[i])} strokeWidth={3} strokeLinecap="round"/>
        ))}
        <line x1={pad} x2={width-pad} y1={height-pad} y2={height-pad} stroke="#ccd"/>
        <line x1={pad} x2={pad} y1={pad} y2={height-pad} stroke="#ccd"/>
        <text x={width-pad} y={height-pad-6} textAnchor="end" className="axislabel">x</text>
        <text x={pad+6} y={pad+12} className="axislabel">y</text>
      </svg>
    </div>
  );
}
