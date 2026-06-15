import React from 'react';
import { Egg, PawPrint, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  createAdminEggDropRate,
  createAdminEggItem,
  createAdminPetSpecies,
  deleteAdminEggDropRate,
  deleteAdminEggItem,
  deleteAdminPetSpecies,
  getAdminEggDropRates,
  getAdminEggItems,
  getAdminPetSpecies,
} from '@/lib/api';

const defaultPet = {
  name: '',
  element: 'FIRE',
  rarity: 'COMMON',
  baseHp: 100,
  baseDamage: 20,
  hpGrowth: 10,
  damageGrowth: 4,
  skillName: '',
  skillDescription: '',
  imageUrl: '',
};

const defaultEgg = {
  name: '',
  description: '',
  priceCoins: 100,
  effectValue: 1,
  imageUrl: '',
};

const fieldClass = 'h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring';
const textAreaClass = 'min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring';

const AdminPetManagement = () => {
  const [pets, setPets] = React.useState([]);
  const [eggs, setEggs] = React.useState([]);
  const [dropRates, setDropRates] = React.useState([]);
  const [petForm, setPetForm] = React.useState(defaultPet);
  const [eggForm, setEggForm] = React.useState(defaultEgg);
  const [dropForm, setDropForm] = React.useState({ eggItemId: '', petSpeciesId: '', dropWeight: 10 });
  const [loading, setLoading] = React.useState(true);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [petData, eggData, rateData] = await Promise.all([
        getAdminPetSpecies(),
        getAdminEggItems(),
        getAdminEggDropRates(),
      ]);
      setPets(petData);
      setEggs(eggData);
      setDropRates(rateData);
      setDropForm((current) => ({
        ...current,
        eggItemId: current.eggItemId || eggData[0]?.id || '',
        petSpeciesId: current.petSpeciesId || petData[0]?.id || '',
      }));
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không tải được dữ liệu pet.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const updatePetForm = (event) => {
    const { name, value } = event.target;
    setPetForm((current) => ({ ...current, [name]: value }));
  };

  const updateEggForm = (event) => {
    const { name, value } = event.target;
    setEggForm((current) => ({ ...current, [name]: value }));
  };

  const updateDropForm = (event) => {
    const { name, value } = event.target;
    setDropForm((current) => ({ ...current, [name]: value }));
  };

  const createPet = async (event) => {
    event.preventDefault();
    try {
      await createAdminPetSpecies({
        ...petForm,
        baseHp: Number(petForm.baseHp),
        baseDamage: Number(petForm.baseDamage),
        hpGrowth: Number(petForm.hpGrowth),
        damageGrowth: Number(petForm.damageGrowth),
      });
      setPetForm(defaultPet);
      toast.success('Đã tạo pet mới.');
      loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không tạo được pet.');
    }
  };

  const createEgg = async (event) => {
    event.preventDefault();
    try {
      await createAdminEggItem({
        ...eggForm,
        priceCoins: Number(eggForm.priceCoins),
        effectValue: eggForm.effectValue === '' ? null : Number(eggForm.effectValue),
      });
      setEggForm(defaultEgg);
      toast.success('Đã tạo trứng pet.');
      loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không tạo được trứng pet.');
    }
  };

  const createDropRate = async (event) => {
    event.preventDefault();
    try {
      await createAdminEggDropRate({
        ...dropForm,
        dropWeight: Number(dropForm.dropWeight),
      });
      setDropForm((current) => ({ ...current, dropWeight: 10 }));
      toast.success('Đã thêm tỉ lệ mở trứng.');
      loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không tạo được tỉ lệ mở trứng.');
    }
  };

  const removePet = async (id) => {
    try {
      await deleteAdminPetSpecies(id);
      toast.success('Đã xóa pet.');
      loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không xóa được pet.');
    }
  };

  const removeEgg = async (id) => {
    try {
      await deleteAdminEggItem(id);
      toast.success('Đã xóa trứng.');
      loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không xóa được trứng.');
    }
  };

  const removeDropRate = async (id) => {
    try {
      await deleteAdminEggDropRate(id);
      toast.success('Đã xóa tỉ lệ.');
      loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không xóa được tỉ lệ.');
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Quản lý Pet & Trứng</h1>
          <p className="text-sm text-muted-foreground">Tạo loài pet, trứng pet và cấu hình tỉ lệ gacha.</p>
        </div>
        <Button variant="outline" onClick={loadData} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Tải lại
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PawPrint className="h-5 w-5" /> Tạo pet mới</CardTitle>
            <CardDescription>Thông số này sẽ được dùng khi học sinh mở trứng nhận pet.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createPet} className="grid gap-3 sm:grid-cols-2">
              <input name="name" value={petForm.name} onChange={updatePetForm} placeholder="Tên pet" className={fieldClass} required />
              <input name="imageUrl" value={petForm.imageUrl} onChange={updatePetForm} placeholder="Image URL" className={fieldClass} />
              <select name="element" value={petForm.element} onChange={updatePetForm} className={fieldClass}>
                {['FIRE', 'WATER', 'EARTH', 'AIR', 'LIGHT', 'DARK'].map((item) => <option key={item}>{item}</option>)}
              </select>
              <select name="rarity" value={petForm.rarity} onChange={updatePetForm} className={fieldClass}>
                {['COMMON', 'RARE', 'EPIC', 'LEGENDARY'].map((item) => <option key={item}>{item}</option>)}
              </select>
              <input name="baseHp" value={petForm.baseHp} onChange={updatePetForm} type="number" min="1" placeholder="Base HP" className={fieldClass} required />
              <input name="baseDamage" value={petForm.baseDamage} onChange={updatePetForm} type="number" min="1" placeholder="Base Damage" className={fieldClass} required />
              <input name="hpGrowth" value={petForm.hpGrowth} onChange={updatePetForm} type="number" min="0" placeholder="HP Growth" className={fieldClass} required />
              <input name="damageGrowth" value={petForm.damageGrowth} onChange={updatePetForm} type="number" min="0" placeholder="Damage Growth" className={fieldClass} required />
              <input name="skillName" value={petForm.skillName} onChange={updatePetForm} placeholder="Tên skill" className={fieldClass} />
              <textarea name="skillDescription" value={petForm.skillDescription} onChange={updatePetForm} placeholder="Mô tả skill" className={`${textAreaClass} sm:col-span-2`} />
              <Button type="submit" className="sm:col-span-2">
                <Plus className="mr-2 h-4 w-4" />
                Tạo pet
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Egg className="h-5 w-5" /> Tạo trứng pet</CardTitle>
            <CardDescription>Trứng là item loại EGG trong shop/gacha.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createEgg} className="grid gap-3 sm:grid-cols-2">
              <input name="name" value={eggForm.name} onChange={updateEggForm} placeholder="Tên trứng" className={fieldClass} required />
              <input name="imageUrl" value={eggForm.imageUrl} onChange={updateEggForm} placeholder="Image URL" className={fieldClass} />
              <input name="priceCoins" value={eggForm.priceCoins} onChange={updateEggForm} type="number" min="0" placeholder="Giá coin" className={fieldClass} required />
              <input name="effectValue" value={eggForm.effectValue} onChange={updateEggForm} type="number" min="0" placeholder="Effect value" className={fieldClass} />
              <textarea name="description" value={eggForm.description} onChange={updateEggForm} placeholder="Mô tả trứng" className={`${textAreaClass} sm:col-span-2`} />
              <Button type="submit" className="sm:col-span-2">
                <Plus className="mr-2 h-4 w-4" />
                Tạo trứng
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cấu hình tỉ lệ mở trứng</CardTitle>
          <CardDescription>Drop weight càng cao thì pet càng dễ xuất hiện trong trứng đó.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={createDropRate} className="grid gap-3 md:grid-cols-[1fr_1fr_140px_auto]">
            <select name="eggItemId" value={dropForm.eggItemId} onChange={updateDropForm} className={fieldClass} required>
              <option value="">Chọn trứng</option>
              {eggs.map((eggItem) => <option key={eggItem.id} value={eggItem.id}>{eggItem.name}</option>)}
            </select>
            <select name="petSpeciesId" value={dropForm.petSpeciesId} onChange={updateDropForm} className={fieldClass} required>
              <option value="">Chọn pet</option>
              {pets.map((pet) => <option key={pet.id} value={pet.id}>{pet.name}</option>)}
            </select>
            <input name="dropWeight" value={dropForm.dropWeight} onChange={updateDropForm} type="number" min="1" className={fieldClass} required />
            <Button type="submit"><Plus className="mr-2 h-4 w-4" /> Thêm</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Danh sách pet</CardTitle>
            <CardDescription>{pets.length} loài pet trong hệ thống.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Hệ</TableHead>
                  <TableHead>Độ hiếm</TableHead>
                  <TableHead>Chỉ số</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pets.map((pet) => (
                  <TableRow key={pet.id}>
                    <TableCell className="font-medium">{pet.name}</TableCell>
                    <TableCell><Badge variant="outline">{pet.element}</Badge></TableCell>
                    <TableCell><Badge>{pet.rarity}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">HP {pet.baseHp} / DMG {pet.baseDamage}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => removePet(pet.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách trứng</CardTitle>
            <CardDescription>{eggs.length} loại trứng pet trong shop/gacha.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {eggs.map((eggItem) => (
                  <TableRow key={eggItem.id}>
                    <TableCell className="font-medium">{eggItem.name}</TableCell>
                    <TableCell>{eggItem.priceCoins} coins</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">{eggItem.description}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => removeEgg(eggItem.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tỉ lệ gacha</CardTitle>
          <CardDescription>{dropRates.length} cấu hình drop rate đang hoạt động.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trứng</TableHead>
                <TableHead>Pet</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {dropRates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell className="font-medium">{rate.eggItemName}</TableCell>
                  <TableCell>{rate.petSpeciesName}</TableCell>
                  <TableCell>{rate.dropWeight}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => removeDropRate(rate.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPetManagement;
