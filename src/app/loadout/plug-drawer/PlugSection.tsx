import { TileGrid } from 'app/dim-ui/TileGrid';
import { PluggableInventoryItemDefinition } from 'app/inventory/item-types';
import { DestinyClass } from 'bungie-api-ts/destiny2';
import { useCallback } from 'react';
import { groupModsByModType } from '../mod-utils';
import styles from './PlugSection.m.scss';
import SelectablePlug from './SelectablePlug';
import { PlugSet } from './types';

/**
 * A section of plugs in the PlugDrawer component, corresponding to a PlugSet. These will be further
 * sub-grouped by mod type.
 */
export default function PlugSection({
  plugSet,
  classType,
  isPlugSelectable,
  onPlugSelected,
  onPlugRemoved,
}: {
  plugSet: PlugSet;
  classType: DestinyClass;
  /** A function to determine if a given plug is currently selectable. */
  isPlugSelectable: (plug: PluggableInventoryItemDefinition) => boolean;
  onPlugSelected: (
    plugSetHash: number,
    mod: PluggableInventoryItemDefinition,
    selectionType: 'multi' | 'single'
  ) => void;
  onPlugRemoved: (plugSetHash: number, mod: PluggableInventoryItemDefinition) => void;
}) {
  const { plugs, maxSelectable, plugSetHash, headerSuffix, selectionType } = plugSet;

  const handlePlugSelected = useCallback(
    (plug: PluggableInventoryItemDefinition) => onPlugSelected(plugSetHash, plug, selectionType),
    [onPlugSelected, plugSetHash, selectionType]
  );

  const handlePlugRemoved = useCallback(
    (plug: PluggableInventoryItemDefinition) => onPlugRemoved(plugSetHash, plug),
    [onPlugRemoved, plugSetHash]
  );

  if (!plugs.length) {
    return null;
  }

  // Here we split the section into further pieces so that each plug category has has its own title
  // This is important for combat mods, which would otherwise be grouped into one massive category
  const plugsGroupedByModType = groupModsByModType(plugs);

  return (
    <>
      {Object.entries(plugsGroupedByModType).map(([groupName, plugs]) => {
        // fall back to headerSuffix if no groupName
        let header = groupName || headerSuffix;
        // use parentheses if both exist
        if (groupName && headerSuffix) {
          header += ` (${headerSuffix})`;
        }

        return (
          <TileGrid key={header} header={header} className={styles.section}>
            {plugs.map((plug) => {
              const isSelected = plugSet.selected.some((s) => s.hash === plug.hash);
              const multiSelect = selectionType === 'multi';
              const selectable = multiSelect
                ? plugSet.selected.length < maxSelectable && isPlugSelectable(plug)
                : !isSelected && isPlugSelectable(plug);
              return (
                <SelectablePlug
                  key={plug.hash}
                  selected={isSelected}
                  plug={plug}
                  classType={classType}
                  selectable={selectable}
                  selectionType={selectionType}
                  removable={multiSelect}
                  onPlugSelected={handlePlugSelected}
                  onPlugRemoved={handlePlugRemoved}
                />
              );
            })}
          </TileGrid>
        );
      })}
    </>
  );
}
