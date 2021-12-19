export const eventMap = Object.freeze({
    mousedown: 'start',
    touchstart: 'start',
    pointerdown: 'start',

    mousemove: 'move',
    touchmove: 'move',
    pointermove: 'move',

    mouseup: 'end',
    touchend: 'end',
    pointerup: 'end',
});

export function pinchZoom(node: HTMLElement) {
    const eventCache: Record<string, PointerEvent> = {};
    let previousDistance = -1;

    node.addEventListener('pointerdown', onPointerDown);
    node.addEventListener('pointermove', onPointerMove);
    node.addEventListener('pointerup', onPointerUp);
    node.addEventListener('pointercancel', onPointerUp);
    node.addEventListener('pointerout' , onPointerUp);
    node.addEventListener('pointerleave', onPointerUp);

    function onPointerDown(event: PointerEvent) {
        eventCache[event.pointerId] = event;
    }

    function onPointerMove(event: PointerEvent) {
        if (event.pointerId in eventCache) {
            eventCache[event.pointerId] = event;
        }

        const events = Object.values(eventCache);
        if (events.length === 2) {
            const distance = Math.hypot(
                events[0].clientX - events[1].clientX,
                events[0].clientY - events[1].clientY,
            );

            if (previousDistance > 0) {
                const pinchZoomEvent = new CustomEvent('pinchzoom', {
                    detail: {
                        original: event,
                        diff: distance - previousDistance,
                    },
                });
                node.dispatchEvent(pinchZoomEvent);
            } else {
                const pinchStartEvent = new CustomEvent('pinchstart', {
                    detail: {
                        original: event,
                    },
                });
                node.dispatchEvent(pinchStartEvent);
            }
        
            previousDistance = distance;
        } else if (events.length < 2) {
            const moveEvent = new CustomEvent('move', {
                detail: {
                    original: event,
                },
            });
            node.dispatchEvent(moveEvent);
        }
    }

    function onPointerUp(event: PointerEvent) {
        if (event.pointerId in eventCache) {
            delete eventCache[event.pointerId];
        }

        if (Object.keys(eventCache).length < 2 && previousDistance !== -1) {
            previousDistance = -1;
            const pinchEndEvent = new CustomEvent('pinchend', {
                detail: {
                    original: event,
                },
            });
            node.dispatchEvent(pinchEndEvent);
        }

    }

    return {
        destroy: () => {
            node.removeEventListener('pointerdown', onPointerDown);
            node.removeEventListener('pointermove', onPointerMove);
            node.removeEventListener('pointerup', onPointerUp);
            node.removeEventListener('pointercancel', onPointerUp);
            node.removeEventListener('pointerout' , onPointerUp);
            node.removeEventListener('pointerleave', onPointerUp);
        },
    };
}
