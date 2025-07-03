const baseUrl = "http://localhost:3001/images/avatars/";

const Avatar = (props) => {
    const size = props.size || 32;
    
    return (
        <img key={props.id}
            src={
                    props?.avatar ? (`${baseUrl}${props.avatar}`) : `${baseUrl}${props.role}_default.png`
            }

            alt={`${props.name} ${props.surname}`}
            className="rounded-circle me-1 mb-1"
            style={{
                width: `${size}px`,
                height: `${size}px`,
                objectFit: 'cover'
            }}
            title={`${props.name} ${props.surname} (${props.username})`}
        />
    );
};

export default Avatar;