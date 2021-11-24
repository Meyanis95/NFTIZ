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
            console.log("Parameters:",name, desc, address);
            parent.postMessage({pluginMessage: {type: 'run_app', name, desc, address}}, '*');
        };

        const onCancel = () => {
            parent.postMessage({pluginMessage: {type: 'cancel'}}, '*');
        };

        return (
            <form>
                <div id="form_style">
                    <label>
                        Name: <input id="form_input" type="text" value={name} onChange={(e) => SetName(e.target.value)} />

                        Description: <input id="form_input" type="textarea" value={desc} onChange={(e) => SetDesc(e.target.value)} />

                        Address: <input id="form_input" type="Address" value={address} onChange={(e) => SetAddress(e.target.value)} />
                    </label>
                </div>
                <button id="mint_button" onClick={handleSubmit}>Mint</button>
                <button onClick={onCancel}>Cancel</button>
            </form>
        );
    }

    React.useEffect(() => {
        // This is how we read messages sent from the plugin controller
        window.onmessage = (event) => {
            const {type, bytes, name, desc, address} = event.data.pluginMessage;
            if (type === 'run') {
                // Here we call the nft.storage API to upload our image on IPFS
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

                // Here we call the NFTPort API to mint the image as an NFT
                async function mint(ipfs_url, name, desc, address) {
                    const data = JSON.stringify({
                        chain: 'rinkeby',
                        name: name,
                        description: desc,
                        file_url: ipfs_url,
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
                                if (json.response ===  'OK') {
                                    console.log('NFT minted!')
                                }
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
            <img src={require('../assets/logo.png')} />
            <h2>Welcome to NFTIZ!</h2>
            <p>To mint a NFT, you need first to select a Frame and then fulfil information needed</p>
            <MyForm />
        </div>
    );
};

export default App;
