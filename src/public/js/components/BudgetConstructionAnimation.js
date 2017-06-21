import React from 'react';

import { max, sum } from 'd3-array';
import { scaleLinear } from 'd3-scale';

function delay(time){
    return () => new Promise(resolve => setTimeout(resolve, time))
}

const DOTATION = 'DOTATION';
const FISCALITE_DIRECTE = 'FISCALITE_DIRECTE';
const FISCALITE_INDIRECTE = 'FISCALITE_INDIRECTE';
const RECETTES_DIVERSES = 'RECETTES_DIVERSES';

const SOLIDARITE = 'SOLIDARITE';
const INTERVENTIONS = 'INTERVENTIONS';
const STRUCTURE = 'STRUCTURE';

const EPARGNE = 'EPARGNE';
const RI_PROPRES = 'RI_PROPRES';
const EMPRUNT = 'EMPRUNT';

const DI = 'DI';

const RF_BRICK_SELECTOR = {
    [DOTATION]: '.dotation-etat',
    [FISCALITE_DIRECTE]: '.fiscalite-directe',
    [FISCALITE_INDIRECTE]: '.fiscalite-indirecte',
    [RECETTES_DIVERSES]: '.recettes-diverses'
};
const DF_BRICK_SELECTOR = {
    [SOLIDARITE]: '.solidarite',
    [INTERVENTIONS]: '.interventions',
    [STRUCTURE]: '.depenses-structure'
};
const RI_BRICK_SELECTOR = {
    [RI_PROPRES]: '.ri-propres',
    [EMPRUNT]: '.emprunt'
};
const DI_BRICK_SELECTOR = {
    [DI]: '.di'
};

const MAX_PARENT_BRICK_SIZE_PROPORTION = 0.85;
const MIN_BRICK_HEIGHT = 4; // em

// unit is seconds
const BRICK_APPEAR_DURATION = 0.2; 
const BETWEEN_BRICK_PAUSE_DURATION = 0.2; 
const BETWEEN_COLUMN_PAUSE_DURATION = 1; 

const MILLISECONDS = 1000;

function Legend(text, amount) {
    return React.createElement('div', { className: 'legend' },
        React.createElement('span', { className: 'text' }, text),
        React.createElement('span', { className: 'amount' }, amount)
    )
}


function animate(container, {dfBrickHeights, riBrickHeights, diBrickHeights, rfBrickHeights}) {

    let rfParent, rfBricks, dfParent, dfBricks, riParent, epargneElement, riBricks, diParent, diBricks;

    const animationStart = Promise.resolve()
        .then(() => {
            // RF
            rfParent = container.querySelector('.brick.rf');
            rfBricks = [DOTATION, FISCALITE_DIRECTE, FISCALITE_INDIRECTE, RECETTES_DIVERSES]
                .map(id => rfParent.querySelector(RF_BRICK_SELECTOR[id]));

            // DF
            dfParent = container.querySelector('.brick.df');
            dfBricks = [STRUCTURE, INTERVENTIONS, SOLIDARITE].map(id => dfParent.querySelector(DF_BRICK_SELECTOR[id]));

            // RI
            riParent = container.querySelector('.brick.ri');
            epargneElement = riParent.querySelector('.epargne');
            riBricks = [RI_PROPRES, EMPRUNT].map(id => riParent.querySelector(RI_BRICK_SELECTOR[id])).concat([epargneElement]);

            // DI
            diParent = container.querySelector('.brick.di');
            diBricks = [DI]
                .map(id => diParent.querySelector(DI_BRICK_SELECTOR[id]));
        })

    // Bring in RF bricks
    const rfBricksStart = animationStart;

    const rfBricksDone = rfBricksStart.then(() => {
        return [DOTATION, FISCALITE_DIRECTE, FISCALITE_INDIRECTE, RECETTES_DIVERSES].reduce((previousDone, id) => {
            return previousDone.then(() => {
                const el = rfParent.querySelector(RF_BRICK_SELECTOR[id]);

                el.style.transitionDuration = `${BRICK_APPEAR_DURATION}s`;
                // using setTimeout otherwise the transition doesn't occur for the first element 
                // (and transitionend event doesn't happen and other elementd don't appear)
                setTimeout( () => {el.style.height = `${rfBrickHeights[id]}em`}, 100)

                return new Promise(resolve => {
                    el.addEventListener('transitionend', resolve, { once: true });
                })
                .then(delay(BETWEEN_BRICK_PAUSE_DURATION*MILLISECONDS))
            })
        }, Promise.resolve());
    });

    // DF bricks
    const dfBricksStart = rfBricksDone.then(delay(BETWEEN_COLUMN_PAUSE_DURATION*MILLISECONDS))

    const dfBricksDone = dfBricksStart.then(() => {
        return [STRUCTURE, INTERVENTIONS, SOLIDARITE].reduce((previousDone, id) => {
            return previousDone.then(() => {
                const el = dfParent.querySelector(DF_BRICK_SELECTOR[id]);

                el.style.transitionDuration = `${BRICK_APPEAR_DURATION}s`;
                el.style.height = `${dfBrickHeights[id]}em`;

                return new Promise(resolve => {
                    el.addEventListener('transitionend', resolve, { once: true });
                })
                .then(delay(BETWEEN_BRICK_PAUSE_DURATION*MILLISECONDS))
            })
        }, Promise.resolve());

    });


    // Epargne brick
    const epargneBrickStart = dfBricksDone.then(delay(BETWEEN_COLUMN_PAUSE_DURATION*MILLISECONDS));

    const epargneBrickDone = epargneBrickStart.then(() => {
        const epargneHeight = riBrickHeights[EPARGNE];

        rfParent.style.transitionDuration = `${BRICK_APPEAR_DURATION}s`;

        epargneElement.style.transitionDuration = `${BRICK_APPEAR_DURATION}s`;
        epargneElement.style.height = `${epargneHeight}em`;

        return new Promise(resolve => {
            epargneElement.addEventListener('transitionend', resolve, { once: true })
        })
    })

    // other RU bricks
    const otherRiBricksStart = epargneBrickDone.then(delay(BETWEEN_COLUMN_PAUSE_DURATION*MILLISECONDS));

    const otherRiBricksDone = otherRiBricksStart.then(() => {
        return [RI_PROPRES, EMPRUNT].reduce((previousDone, id) => {
            return previousDone.then(() => {
                const el = riParent.querySelector(RI_BRICK_SELECTOR[id]);

                el.style.transitionDuration = `${BRICK_APPEAR_DURATION}s`;
                el.style.height = `${riBrickHeights[id]}em`;

                return new Promise(resolve => {
                    el.addEventListener('transitionend', resolve, { once: true })
                })
                .then(delay(BETWEEN_BRICK_PAUSE_DURATION*MILLISECONDS))
            })
        }, Promise.resolve());
    });

    // DI bricks
    const diBricksStart = otherRiBricksDone.then(delay(BETWEEN_COLUMN_PAUSE_DURATION*MILLISECONDS));

    const diBricksDone = diBricksStart.then(() => {
        const diParent = container.querySelector('.brick.di')

        return [DI].reduce((previousDone, id) => {
            return previousDone.then(() => {
                const el = diParent.querySelector(DI_BRICK_SELECTOR[id]);

                el.style.transitionDuration = `${BRICK_APPEAR_DURATION}s`;
                el.style.height = `${diBrickHeights[id]}em`;

                return new Promise(resolve => {
                    el.addEventListener('transitionend', resolve, { once: true })
                })
                .then(delay(BETWEEN_BRICK_PAUSE_DURATION*MILLISECONDS))
            })
        }, Promise.resolve());
    });

    // Replay button
    const addReplayButton = diBricksDone
    .then(delay(BETWEEN_COLUMN_PAUSE_DURATION*MILLISECONDS))
    .then(() => {
        const replayButton = document.querySelector('.replay');

        replayButton.style.transitionDuration = `${BRICK_APPEAR_DURATION}s`;
        replayButton.style.opacity = `1`;

        // reset styles
        replayButton.addEventListener('click', () => {
            rfBricks.forEach(el => { el.style.height = 0; })
            dfBricks.forEach(el => { el.style.height = 0; })
            riBricks.forEach(el => { el.style.height = 0; })
            diBricks.forEach(el => { el.style.height = 0; })

            // replay
            // let some time pass so transition actually occurs
            setTimeout( () => {
                animate(container, { dfBrickHeights, riBrickHeights, diBrickHeights, rfBrickHeights })
            }, 100);
            
            
        })

    });

    const endOfAnimation = addReplayButton;

    return endOfAnimation.catch(e => console.error('animation error', e))

}


function doTheMaths({
    DotationEtat, FiscalitéDirecte, FiscalitéIndirecte, RecettesDiverses,
    Solidarité, Interventions, DépensesStructure,
    RIPropre, Emprunt,
    RemboursementEmprunt, Routes, Colleges, Amenagement, Subventions
}, bricksContainerSize) {

    const rf = sum([DotationEtat, FiscalitéDirecte, FiscalitéIndirecte, RecettesDiverses]);
    const df = sum([Solidarité, Interventions, DépensesStructure]);

    const epargne = rf - df;

    const ri = epargne + RIPropre + Emprunt;
    const di = RemboursementEmprunt + Routes + Colleges + Amenagement + Subventions;

    const maxAmount = max([rf, ri, df, di]);
    const maxHeight = MAX_PARENT_BRICK_SIZE_PROPORTION * bricksContainerSize;

    const amountScale = scaleLinear()
        .domain([0, maxAmount])
        .range([0, maxHeight]);

    const rfBrickHeights = {
        [DOTATION]: Math.max(amountScale(DotationEtat), MIN_BRICK_HEIGHT),
        [FISCALITE_DIRECTE]: Math.max(amountScale(FiscalitéDirecte), MIN_BRICK_HEIGHT),
        [FISCALITE_INDIRECTE]: Math.max(amountScale(FiscalitéIndirecte), MIN_BRICK_HEIGHT),
        [RECETTES_DIVERSES]: Math.max(amountScale(RecettesDiverses), MIN_BRICK_HEIGHT)
    };

    const dfBrickHeights = {
        [SOLIDARITE]: Math.max(amountScale(Solidarité), MIN_BRICK_HEIGHT),
        [INTERVENTIONS]: Math.max(amountScale(Interventions), MIN_BRICK_HEIGHT),
        [STRUCTURE]: Math.max(amountScale(DépensesStructure), MIN_BRICK_HEIGHT)
    };

    const riBrickHeights = {
        [EPARGNE]: Math.max(amountScale(epargne), MIN_BRICK_HEIGHT),
        [RI_PROPRES]: Math.max(amountScale(RIPropre), MIN_BRICK_HEIGHT),
        [EMPRUNT]: Math.max(amountScale(Emprunt), MIN_BRICK_HEIGHT)
    };

    const diBrickHeights = {
        [DI]: 8
    };

    return {
        rf, ri, df, di,
        maxAmount,
        rfBrickHeights,
        dfBrickHeights,
        riBrickHeights,
        diBrickHeights
    }
}


export default class BudgetConstructionAnimation extends React.Component {

    constructor() {
        super();
        this.state = {
            bricksContainerSize: undefined // em
        };
    }

    financeDataReady(props) {
        return !!props.DotationEtat;
    }

    animateAndLockComponent(props, bricksContainerSize) {
        if (this.financeDataReady(props) && bricksContainerSize) {
            const {dfBrickHeights, riBrickHeights, diBrickHeights, rfBrickHeights} = doTheMaths(props, bricksContainerSize);

            animate(this.refs.container, { dfBrickHeights, riBrickHeights, diBrickHeights, rfBrickHeights });
            setTimeout(() => this.setState(Object.assign({}, this.state)))
        }
    }

    componentDidMount() {
        const bricksContainer = this.refs.container.querySelector('.bricks');
        // these sizes are in px
        const {fontSize, height} = getComputedStyle(bricksContainer);

        this.setState(Object.assign(
            {},
            this.state,
            {
                bricksContainerSize: parseFloat(height) / parseFloat(fontSize)
            }
        ));

        // so the state is actually up to date when calling animateAndLockComponent
        setTimeout(() => {
            this.animateAndLockComponent(this.props, this.state.bricksContainerSize)
        });
    }

    componentWillUnmount() {
        this.setState({
            bricksContainerSize: undefined // em
        })
    }

    componentWillReceiveProps(nextProps) {
        this.animateAndLockComponent(nextProps, this.state.bricksContainerSize);
    }

    render() {
        const amounts = this.props;
        const {bricksContainerSize} = this.state;

        const {
            DotationEtat, FiscalitéDirecte, FiscalitéIndirecte, RecettesDiverses,
            Solidarité, Interventions, DépensesStructure,
            RIPropre, Emprunt,
            RemboursementEmprunt, Routes, Colleges, Amenagement, Subventions
        } = amounts;

        const rf = DotationEtat + FiscalitéDirecte + FiscalitéIndirecte + RecettesDiverses
        const df = Solidarité + Interventions + DépensesStructure
        const epargne = rf - df;
        const ri = epargne + RIPropre + Emprunt;
        const di = RemboursementEmprunt + Routes + Colleges + Amenagement + Subventions;

        const maxAmount = max([rf, ri, df, di]);

        const maxHeight = MAX_PARENT_BRICK_SIZE_PROPORTION * bricksContainerSize;
        const rfHeight = maxHeight * rf / maxAmount;
        const dfHeight = maxHeight * df / maxAmount;

        const riHeight = maxHeight * ri / maxAmount;
        const diHeight = maxHeight * di / maxAmount;

        return React.createElement('article', { className: 'budget-construction', ref: 'container' },
            React.createElement('div', { className: 'bricks' },
                DotationEtat ? [
                    React.createElement('a', 
                        { 
                            className: 'column',
                            href: '#!/finance-details/RF'
                        },
                        React.createElement('div', {className: 'legend'},
                            React.createElement('div', {className: 'number'}, (rf/1000000).toFixed(0) ),
                            React.createElement('div', {className: 'text'}, 
                                React.createElement('span', {className: 'unit'}, ` millions d'euros`),
                                React.createElement('span', {}, `Recettes de fonctionnement`)
                            )
                        ),
                        React.createElement(
                            'div',
                            {
                                className: 'brick parent rf'
                            },
                            React.createElement('div', { className: 'brick appear-by-height dotation-etat'}, 
                                Legend(`Dotation de l'Etat`, `${(DotationEtat/1000000).toFixed(0)} millions`)
                            ),
                            React.createElement('div', { className: 'brick appear-by-height fiscalite-directe' }, 
                                Legend('Fiscalité directe', `${(FiscalitéDirecte/1000000).toFixed(0)} millions`)
                            ),
                            React.createElement('div', { className: 'brick appear-by-height fiscalite-indirecte'}, 
                                Legend('Fiscalité indirecte', `${(FiscalitéIndirecte/1000000).toFixed(0)} millions`)
                            ),
                            React.createElement('div', { className: 'brick appear-by-height recettes-diverses' }, 
                                Legend('Recettes diverses', `${(RecettesDiverses/1000000).toFixed(0)} millions`)
                            )
                        )
                    ),
                    React.createElement('a', 
                        { 
                            className: 'column',
                            href: '#!/finance-details/DF'
                        },
                        React.createElement('div', {className: 'legend'},
                            React.createElement('div', {className: 'number'}, (df/1000000).toFixed(0) ),
                            React.createElement('div', {className: 'text'}, 
                                React.createElement('span', {className: 'unit'}, ` millions d'euros`),
                                React.createElement('span', {}, `Dépenses de fonctionnement`)
                            )
                        ),
                        React.createElement(
                            'div',
                            {
                                className: 'brick parent df'
                            },
                            React.createElement('div', { className: 'brick appear-by-height solidarite' }, 
                                Legend(`Solidarité`, `${(Solidarité/1000000).toFixed(0)} millions`)
                            ),
                            React.createElement('div', { className: 'brick appear-by-height interventions' }, 
                                Legend('Interventions', `${(Interventions/1000000).toFixed(0)} millions`)
                            ),
                            React.createElement('div', { className: 'brick appear-by-height depenses-structure' }, 
                                Legend('Dépenses de structure', `${(DépensesStructure/1000000).toFixed(0)} millions`)
                            )
                        )
                    ),
                    React.createElement('a', 
                        { 
                            className: 'column',
                            href: '#!/finance-details/RI'
                        },
                        React.createElement('div', {className: 'legend'},
                            React.createElement('div', {className: 'number'}, (ri/1000000).toFixed(0) ),
                            React.createElement('div', {className: 'text'}, 
                                React.createElement('span', {className: 'unit'}, ` millions d'euros`),
                                React.createElement('span', {}, `Recettes d'investissement`)
                            )
                        ),
                        React.createElement(
                            'div',
                            {
                                className: 'brick parent ri'
                            },
                            React.createElement('div', { className: 'brick appear-by-height epargne' }, 
                                Legend(`Epargne`, `${(epargne/1000000).toFixed(0)} millions`)
                            ),
                            React.createElement('div', { className: 'brick appear-by-height ri-propres' }, 
                                Legend('RI propres', `${(RIPropre/1000000).toFixed(0)} millions`)
                            ),
                            React.createElement('div', { className: 'brick appear-by-height emprunt' }, 
                                Legend('Emprunt', `${(Emprunt/1000000).toFixed(0)} millions`)
                            )
                        )
                    ),
                    React.createElement('a', 
                        { 
                            className: 'column',
                            href: '#!/finance-details/DI'
                        },
                        React.createElement('div', {className: 'legend'},
                            React.createElement('div', {className: 'number'}, (di/1000000).toFixed(0) ),
                            React.createElement('div', {className: 'text'}, 
                                React.createElement('span', {className: 'unit'}, ` millions d'euros`),
                                React.createElement('span', {}, `Dépenses d'investissement`)
                            )
                        ),
                        React.createElement(
                            'div',
                            {
                                className: 'brick parent di'
                            },
                            React.createElement('div', { className: 'brick appear-by-height di' }, 
                                Legend(`RemboursementEmprunt + Routes + Colleges + Amenagement + Subventions`, `${(di/1000000).toFixed(0)} millions`)
                            )
                        )
                    )
                ] : undefined
            ),
            React.createElement('hr'),
            React.createElement('dl', {},
                React.createElement('div', { className: 'column' },
                    React.createElement('dt', {}, 'Recettes de fonctionnement'),
                    React.createElement('dd', {}, `Ces recettes proviennent principalement du produit des impôts et taxes directes et indirectes, ainsi que des dotations versées par l'État`),
                    React.createElement('dt', {}, 'Emprunt'),
                    React.createElement('dd', {}, `Il permet au Département d'atteindre l’équilibre budgétaire et d’investir dans des projets d’ampleur ou durables.`)
                ),
                React.createElement('div', { className: 'column' },
                    React.createElement('dt', {}, 'Dépenses de fonctionnement'),
                    React.createElement('dd', {}, `Ces dépenses financent principalement les allocations et prestations sociales ou de solidarité, les services de secours (pompiers), les transports, les collèges, les routes, ainsi que le fonctionnement propre du Département (salaires et moyens) et les intérêts d’emprunts. `)
                ),
                React.createElement('div', { className: 'column' },
                    React.createElement('dt', {}, 'Recettes d’investissement'),
                    React.createElement('dd', {}, `Elles sont principalement constituées de dotations de l’Etat et de subventions`),
                    React.createElement('dt', {}, `Dépenses d'investissement`),
                    React.createElement('dd', {}, `Elles concernent des programmes structurants ou stratégiques pour le développement du territoire girondin : bâtiments, routes, collèges, etc.`)
                )
            ),
            React.createElement('button', { className: 'replay' }, 
                React.createElement('i',  { className: 'fa fa-play-circle-o' }),
                ' rejouer'
            )
        );
    }
}
