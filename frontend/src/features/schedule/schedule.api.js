import { httpClient } from '../../api/httpClient';

export async function fetchScheduleBoardApi({ fieldTypeId, date }) {
  const { data } = await httpClient.get('/schedule', { params: { fieldTypeId, date } });
  return data.data;
}

export async function fetchFieldScheduleApi({ fieldId, date }) {
  const { data } = await httpClient.get(`/fields/${fieldId}/schedule`, { params: { date } });
  return data.data;
}
