import React from 'react';

export default function D3Axis({
    tickData, className
}){
    return React.createElement('g', {className: ['d3-axis', className].filter(x => x).join(' ')}, 
        tickData.map(({transform, line: {x1, y1, x2, y2}, text: {x, y, dx, dy, anchor='middle', t}, className: tickClass }) => {
            return React.createElement('g', {className: ['tick', tickClass].filter(x=>x).join(' '), transform}, 
                React.createElement('line', {x1, y1, x2, y2}),
                React.createElement('text', {x, y, dx, dy, textAnchor: anchor}, t)
            )
        })
    )
}
