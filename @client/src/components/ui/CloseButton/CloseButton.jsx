import "./CloseButton.css";

const CloseButton = ({ onClick }) => {
    return (
        <img
            src="./closeDialog.svg"
            alt="close"
            onClick={onClick}
            className="close-button"
        />
    );
};

export default CloseButton;