import { Card, Tabs, Tab, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';

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
                    <div className="d-flex justify-content-end" style={{ position: 'absolute', top: '10px', right: '15px', zIndex: 10 }}>
                        {isStudent && weightedAverage > 0 && (
                            <div className="position-relative">
                                <OverlayTrigger
                                    placement="left"
                                    overlay={
                                        <Tooltip>
                                            La  media media ponderata è calcolata considerando come pesi  
                                            l’inverso  del  numero  di  studenti  nel gruppo. 
                                        </Tooltip>
                                    }
                                >
                                    <span
                                        className="position-absolute bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center"
                                        style={{
                                            cursor: 'pointer',
                                            fontSize: '10px',
                                            fontWeight: 'bold',
                                            width: '16px',
                                            height: '16px',
                                            top: '-8px',
                                            right: '-8px',
                                            zIndex: 11
                                        }}
                                    >
                                        i
                                    </span>
                                </OverlayTrigger>
                                <Badge bg="info" className="fs-6 p-2">
                                    Media Ponderata: {weightedAverage}/30
                                </Badge>
                            </div>
                        )}
                    </div>
                </Tab>

            </Tabs>

        </Card.Header>

    );
};

export default TaskHeader;
