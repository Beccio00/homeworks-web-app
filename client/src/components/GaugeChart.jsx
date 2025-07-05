import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const GaugeChart = ({ value, width = "100%", height = 200 }) => {
    const RADIAN = Math.PI / 180;
    const cx = 190;
    const cy = 160; 
    const iR = 50;
    const oR = 80;
    
    const getGaugeData = () => {
        return [
            { value: 18, color: '#FF0000' }, // Red
            { value: 6, color: '#FF8042' },  // Orange
            { value: 4, color: '#FFBB28' },  // Yellow
            { value: 2, color: '#00C49F' }   // Green
        ];
    };

    const getGaugeColor = (value) => {
        if (value >= 28) return '#00C49F'; 
        if (value >= 24) return '#FFBB28'; 
        if (value >= 20) return '#FF8042'; 
        if (value >= 18) return '#FF8042'; 
        return '#FF0000'; 
    };

    const needle = (value, data, cx, cy, iR, oR, color) => {
        let total = 0;
        data.forEach((v) => {
            total += v.value;
        });
        const ang = 180.0 * (1 - value / total);
        const length = (iR + 2 * oR) / 3;
        const sin = Math.sin(-RADIAN * ang);
        const cos = Math.cos(-RADIAN * ang);
        const r = 5;
        const x0 = cx;
        const y0 = cy;
        const xba = x0 + r * sin;
        const yba = y0 - r * cos;
        const xbb = x0 - r * sin;
        const ybb = y0 + r * cos;
        const xp = x0 + length * cos;
        const yp = y0 + length * sin;

        return [
            <circle key="circle" cx={x0} cy={y0} r={r} fill={color} stroke="none" />,
            <path key="path" d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`} stroke="none" fill={color} />,
        ];
    };

    return (
        <div className="text-center" style={{ position: 'relative' }}>
            <ResponsiveContainer width={width} height={height}>
                <PieChart>
                    <Pie
                        data={getGaugeData()}
                        cx="50%"
                        cy="80%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        stroke="none"
                    >
                        {getGaugeData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            
            <svg 
                style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    width: '100%',
                    height: height,
                    pointerEvents: 'none'
                }}
            >
                {needle(value, getGaugeData(), cx, cy, iR, oR, '#333')}
            </svg>
            
            <div style={{ marginTop: '-30px', fontSize: '24px', fontWeight: 'bold', color: getGaugeColor(value) }}>
                {value.toFixed(1)}/30
            </div>
            
            <div className="mt-2">
                <div className="d-flex justify-content-center flex-wrap">
                    <small className="me-3 d-flex align-items-center">
                        <div style={{ width: '10px', height: '10px', backgroundColor: '#FF0000', marginRight: '2px' }}></div>
                        0-18
                    </small>
                    <small className="me-3 d-flex align-items-center">
                        <div style={{ width: '10px', height: '10px', backgroundColor: '#FF8042', marginRight: '2px' }}></div>
                        18-24
                    </small>
                    <small className="me-3 d-flex align-items-center">
                        <div style={{ width: '10px', height: '10px', backgroundColor: '#FFBB28', marginRight: '2px' }}></div>
                        24-28
                    </small>
                    <small className="d-flex align-items-center">
                        <div style={{ width: '10px', height: '10px', backgroundColor: '#00C49F', marginRight: '2px' }}></div>
                        28-30
                    </small>
                </div>
            </div>
        </div>
    );
};

export default GaugeChart;