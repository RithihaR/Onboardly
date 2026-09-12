import { Button, StatusIndicator } from '../../../packages/shared-ui';

function App() {
    return (
        <div style={{ padding: '2rem' }}>
            <h1>Onboardly Dashboard</h1>
            <Button variant="primary" size="lg">Save</Button>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '12px' }}>
                <StatusIndicator status="not-started" />
                <StatusIndicator status="in-progress" />
                <StatusIndicator status="complete" />
            </div>
        </div>
    );
}

export default App;