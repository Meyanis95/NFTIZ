figma.showUI(__html__);
figma.ui.resize(300,360);

figma.ui.onmessage = (msg) => {
    if (msg.type === 'run_app') {
        async function getBytes() {
            for (const node of figma.currentPage.selection) {
                const bytes = await node.exportAsync();

                // This is how figma responds back to the ui
                figma.ui.postMessage({
                    type: 'run',
                    bytes: bytes,
                    name: msg.name,
                    desc: msg.desc,
                    address: msg.address,
                });
            }
        }
        getBytes();
    } else figma.closePlugin();
};
