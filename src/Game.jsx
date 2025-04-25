import { useState } from "react";
import PageContainer from "./PageContainer";
import SpyView from "./SpyView";
import PlayerView from "./PlayerView";

export default function Game({ player, event }) {
    const { isSpy, persona } = player;
    const [showDesc, setShowDesc] = useState(true);

    return (
        <PageContainer>
            {isSpy ? (
                <SpyView />
            ) : (
                <PlayerView
                    persona={persona}
                    event={event}
                    showDesc={showDesc}
                    toggleDesc={() => setShowDesc(prev => !prev)}
                />
            )}
        </PageContainer>
    );
}