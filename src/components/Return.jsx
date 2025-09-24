import { useNavigate } from 'react-router-dom';
function Return() {
    const navigate = useNavigate();
    return (
        <div className="return">
        <button 
            className="back-button"
            onClick={() => navigate('/')}>
            <img src="/left.svg" alt="home" className="back-button-img" />
        </button>
        </div>
    );
}
export default Return;
