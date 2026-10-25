import React from 'react';

const style = {
    root: {
        flexGrow: 1,
        display:'flex',
        paddingTop: 11,
        marginBottom: 8,
    },
};

function FormInput (props) {
    return (
        <div style={style.root}>
          <div>
            <button className="button">
              Filter
            </button>
          </div>

          <div className="field" style={{flexGrow: 1}}>
            <div className="control" style={{width:'100%'}}>
              <input className="input is-primary"
                     type="text" />
            </div>
          </div>
        </div>
    );
}

export default FormInput;
