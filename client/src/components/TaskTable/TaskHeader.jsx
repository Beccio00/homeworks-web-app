import { Card, Tabs, Tab, Badge } from 'react-bootstrap';

const TaskHeader = ({ isStudent, isTeacher, activeTab, onTabSelect, weightedAverage }) => {
    return (
        <Card.Header>
            {isStudent ? (
                <Tabs 
                    activeKey={activeTab}
                    onSelect={onTabSelect}
                    className="border-bottom-0"
                >
                    <Tab eventKey="open" title="📚 Compiti Aperti">
                        <div className="mt-3">
                            <h5 className="mb-0">📚 I Tuoi Compiti Aperti</h5>
                        </div>
                    </Tab>
                    <Tab eventKey="closed" title="✅ Compiti Completati">
                        <div className="mt-3 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">✅ Compiti Completati</h5>
                            {weightedAverage > 0 && (
                                <Badge bg="info" className="fs-6 p-2">
                                    Media Pesata: {weightedAverage}/30
                                </Badge>
                            )}
                        </div>
                    </Tab>
                </Tabs>
            ) : (
                <h5 className="mb-0">📝 Compiti Assegnati</h5>
            )}
        </Card.Header>
    );
};

export default TaskHeader;
