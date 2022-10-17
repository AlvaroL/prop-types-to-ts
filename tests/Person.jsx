import React from 'react';
import PropTypes from 'prop-types';

export const Person = ({name, married, age, gender, walk}) => {
    return (<div>
        <div>name: {name}</div>
        <div>married: {married}</div>
        <div>age: {age}</div>
        <div>gender: {gender}</div>
        <button marginBottom={Layout.L} onClick={walk}>walk</button>
    </div>);
}

Person.propTypes = {
    name: PropTypes.string,
    married: PropTypes.bool,
    age: PropTypes.number,
    gender: PropTypes.oneOf(['male', 'female', 'neutral']),
    walk: PropTypes.func,
    surname: PropTypes.string.isRequired,
    handed: PropTypes.oneOf(['left', 'right']).isRequired,
};
