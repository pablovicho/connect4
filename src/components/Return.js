import { useHistory } from 'react-router-dom';
function Return() {
    const history = useHistory();
    return (
        <div className="return">
        <button 
            className="back-button"
            onClick={() => history.push('/')}
            >
            <img src="/left.svg" alt="home" className="back-button-img" />
        </button>
        </div>
    );
}
export default Return;
