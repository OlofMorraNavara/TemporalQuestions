export const recordValueInHistoryActivityType = 'recordValueInHistory';

export type RecordValueInHistoryActivity<TValue = unknown> = (value: TValue) => Promise<{ value: NoInfer<TValue> }>;

/**
 * Basic implementation of the {@link RecordValueInHistoryActivity} activity which can (and probably should) be used as the implementation
 */
export const recordValueInHistoryActivity: RecordValueInHistoryActivity = async (...args) => ({
    value: args[0],
});

export type RecordValueInHistoryActivities = {
    [recordValueInHistoryActivityType]: RecordValueInHistoryActivity;
};
