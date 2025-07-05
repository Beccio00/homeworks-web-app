import { Card, Tabs, Tab, Badge } from 'react-bootstrap';

const TaskHeader = ({ isStudent, isTeacher, activeTab, onTabSelect, weightedAverage }) => {
    return (
        <Card.Header>
            <Tabs
                activeKey={activeTab}
                onSelect={onTabSelect}
                className="border-bottom-0"
            >
                <Tab eventKey="open" title="📚 Compiti Aperti">
                </Tab>
                <Tab eventKey="closed" title="✅ Compiti Chiusi">
                    <div className="d-flex justify-content-end" style={{position: 'absolute', top: '10px', right: '15px', zIndex: 10}}>
                        {isStudent && weightedAverage > 0 && (
                            <Badge bg="info" className="fs-6 p-2">
                                Media Pesata: {weightedAverage}/30
                            </Badge>
                        )}
                    </div>
                </Tab>

            </Tabs>

        </Card.Header>

    );
};

export default TaskHeader;
