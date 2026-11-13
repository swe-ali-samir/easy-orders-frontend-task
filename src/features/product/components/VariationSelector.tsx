import type { VariantSelection, VariationGroup } from '../../../types/domain';
import { cn } from '../../../utils/cn';
import { capitalize } from '../../../utils/text';
import { ProductImage } from '../../../components/ui/ProductImage';
import { StaticLink } from '../../../components/ui/StaticLink';

interface VariationSelectorProps {
  groups: VariationGroup[];
  selection: VariantSelection;
  /** Compatible with the other selected groups. */
  isAvailable: (groupName: string, optionName: string) => boolean;
  /** Purchasable in at least one combination; otherwise disabled. */
  isSelectable: (groupName: string, optionName: string) => boolean;
  onSelect: (groupName: string, optionName: string) => void;
}

/**
 * - `available`: compatible with the current selection.
 * - `conflict`: exists, but not with the current selection. Styled unavailable but still
 *   clickable; choosing it clears the conflicting selection (no dead ends).
 * - `unavailable`: no purchasable combination at all; disabled.
 */
type OptionState = 'available' | 'conflict' | 'unavailable';

interface OptionProps {
  label: string;
  selected: boolean;
  state: OptionState;
  onSelect: () => void;
}

const CONFLICT_SUFFIX = 'not available with current selection';

const optionBase =
  'w-full rounded-lg border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900';

function accessibleName(label: string, state: OptionState): string | undefined {
  return state === 'conflict' ? `${label}, ${CONFLICT_SUFFIX}` : undefined;
}

function SwatchOption({
  label,
  selected,
  state,
  onSelect,
  groupName,
  imageUrl,
}: OptionProps & { groupName: string; imageUrl?: string }) {
  const name = `${groupName}: ${label}`;
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={accessibleName(name, state) ?? name}
      title={capitalize(label)}
      disabled={state === 'unavailable'}
      onClick={onSelect}
      className={cn(
        optionBase,
        'h-10 p-1 lg:h-[42px]',
        selected ? 'border-gray-900' : 'border-transparent',
        state !== 'unavailable' && !selected && 'hover:border-gray-300',
        state === 'conflict' && 'opacity-50 grayscale',
        state === 'unavailable' && 'cursor-not-allowed opacity-30 grayscale',
      )}
    >
      <span className="block h-full w-full overflow-hidden rounded-md bg-gray-100">
        {imageUrl && <ProductImage src={imageUrl} alt="" />}
      </span>
    </button>
  );
}

function TextOption({ label, selected, state, onSelect }: OptionProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={accessibleName(label, state)}
      disabled={state === 'unavailable'}
      onClick={onSelect}
      className={cn(
        optionBase,
        'flex min-h-10 items-center justify-center break-words px-2 py-1 text-center text-base font-semibold leading-tight lg:min-h-[42px] lg:text-lg',
        selected ? 'border-gray-900 bg-gray-200' : 'border-gray-200 bg-white hover:border-gray-400',
        // Conflict options stay clickable, so their text must keep >= 4.5:1 contrast
        // (gray-500 = 4.74:1); a dashed border signals the state without relying on colour.
        // Disabled ones are exempt from WCAG contrast and are dimmed further.
        state === 'available' && 'text-gray-900',
        state === 'conflict' && 'border-dashed text-gray-500 line-through',
        state === 'unavailable' && 'cursor-not-allowed text-gray-900 line-through opacity-40',
      )}
    >
      {label}
    </button>
  );
}

/** Shown next to the size group, per the design. Static by scope decision (no size chart data). */
function SizeChartLink() {
  return (
    <StaticLink className="hidden text-sm font-medium text-gray-900 underline underline-offset-4 sm:inline lg:text-base">
      View Size Chart
    </StaticLink>
  );
}

export function VariationSelector({
  groups,
  selection,
  isAvailable,
  isSelectable,
  onSelect,
}: VariationSelectorProps) {
  if (groups.length === 0) {
    return null;
  }

  const stateOf = (groupName: string, optionName: string): OptionState => {
    if (!isSelectable(groupName, optionName)) return 'unavailable';
    return isAvailable(groupName, optionName) ? 'available' : 'conflict';
  };

  return (
    <div className="space-y-6 lg:space-y-8" data-testid="variation-selector">
      {groups.map((group) => {
        const label = capitalize(group.name);
        const selected = selection[group.name];
        return (
          <div
            key={group.id}
            role="group"
            aria-label={`Select ${label}`}
            data-variation-group={group.name}
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-base lg:text-xl">
                <span className="text-gray-500">{label}: </span>
                <span className="font-bold text-gray-900">
                  {selected ? capitalize(selected) : ''}
                </span>
              </p>
              {group.name.toLowerCase() === 'size' && <SizeChartLink />}
            </div>
            {/* 4 per row on mobile, 6 on desktop (design). */}
            <div className="mt-3 grid grid-cols-4 gap-3 lg:mt-4 lg:grid-cols-6 lg:gap-4">
              {group.options.map((option) => {
                const props: OptionProps = {
                  selected: selected === option.name,
                  state: stateOf(group.name, option.name),
                  onSelect: () => onSelect(group.name, option.name),
                  label: option.name,
                };
                return group.type === 'image' ? (
                  <SwatchOption
                    key={option.id}
                    {...props}
                    groupName={group.name}
                    imageUrl={option.value}
                  />
                ) : (
                  <TextOption key={option.id} {...props} />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
