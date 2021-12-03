import * as React from 'react';
import {useState} from 'react';
import '../styles/ui.css';

declare function require(path: string): any;

const App = ({}) => {

    function MyForm() {
        const [name, SetName] = useState('');
        const [desc, SetDesc] = useState('');
        const [address, SetAddress] = useState('');

        const handleSubmit = (event) => {
            event.preventDefault();
            if (name !== '' && desc !== '' && address !== '') {
                parent.postMessage({pluginMessage: {type: 'run_app', name, desc, address}}, '*');
            }
        };

        const onCancel = () => {
            parent.postMessage({pluginMessage: {type: 'cancel'}}, '*');
        };

        return (
            <div>
                <form>
                    <div id="form_style">
                        <label>
                            Name*: <input id="form_input_name" type="text" value={name} onChange={(e) => SetName(e.target.value)} required/>
                        </label>
                        <label>
                            Description*: <textarea id="form_input_desc" rows={3} value={desc} onChange={(e) => SetDesc(e.target.value)} required/>
                        </label>
                        <label>
                            Ethereum address*: <input id="form_input_add" type="text" value={address} onChange={(e) => SetAddress(e.target.value)} required/>
                        </label>
                    </div>
                    <button type="submit" id="mint_button" onClick={handleSubmit}>Mint</button>
                    <button id="close_button" onClick={onCancel}>Cancel</button>
                </form>
            </div>
        );
    }

    return (

    <div>
        <div>
            <div className="v2_25"></div>
        </div>
        <p className="v2_26">To mint a NFT, you need first to select a Frame and then fulfil information needed</p>
        <MyForm />
    </div>  
    );
};

export default App;
