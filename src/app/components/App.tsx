import * as React from 'react';
import {useState} from 'react';
import '../styles/ui.css';

declare function require(path: string): any;

const App = ({}) => {
    const onCancel = () => {
        parent.postMessage({pluginMessage: {type: 'cancel'}}, '*');
    };

    function MyForm() {
        const [name, SetName] = useState('');
        const [desc, SetDesc] = useState('');
        const [address, SetAddress] = useState('');

        const handleSubmit = (event) => {
            event.preventDefault();
            console.log(name, desc, address);
            parent.postMessage({pluginMessage: {type: 'run_app', name, desc, address}}, '*');
        };

        return (
            <form>
                <label>
                    Name: <input type="text" value={name} onChange={(e) => SetName(e.target.value)} />
                    Description: <input type="description" value={desc} onChange={(e) => SetDesc(e.target.value)} />
                    Address: <input type="Address" value={address} onChange={(e) => SetAddress(e.target.value)} />
                </label>

                <button onClick={handleSubmit}>Mint</button>
            </form>
        );
    }

    React.useEffect(() => {
        // This is how we read messages sent from the plugin controller
        window.onmessage = (event) => {
            const {type, bytes, name, desc, address} = event.data.pluginMessage;
            if (type === 'run') {
                async function main() {
                    var url = 'https://api.nft.storage/upload';
                    var data = new Blob([bytes], {type: 'image/png'});

                    const result = await fetch(url, {
                        method: 'POST',
                        headers: {
                            Authorization: process.env.NFT_STORAGE_KEY,
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: data,
                    }).then((response) => {
                        return response.json().then(function (json) {
                            console.log('IPFS url: ', 'https://ipfs.io/ipfs/' + json.value.cid.toString());
                            return 'https://ipfs.io/ipfs/' + json.value.cid.toString();
                        });
                    });

                    return result;
                }

                async function mint(url_to_pass, name, desc, address) {
                    const data = JSON.stringify({
                        chain: 'rinkeby',
                        name: name,
                        description: desc,
                        file_url: url_to_pass,
                        mint_to_address: address,
                    });

                    fetch('https://api.nftport.xyz/v0/mints/easy/urls', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: process.env.NFTPORT_KEY,
                        },
                        body: data,
                    })
                        .then((response) => {
                            return response.json().then(function (json) {
                                console.log('Status:', json.response);
                                console.log('Transaction hash:', json.transaction_hash);
                                console.log('Transaction url:', json.transaction_external_url);
                                console.log(response);
                            });
                        })
                        .catch((err) => {
                            console.error(err);
                        });
                }
                console.log('wéwé');

                async function run() {
                    const ipfs_url = await main();
                    mint(ipfs_url, name, desc, address);
                }

                run();
            }
        };
    }, []);

    return (
        <div>
            <img src={require('../assets/logo.svg')} />
            <h2>NFTIZ Plugin</h2>
            <MyForm />
            <button onClick={onCancel}>Cancel</button>
        </div>
    );
};

export default App;
