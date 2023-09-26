import { useRef, useState } from 'react';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';

export default function DeleteUserForm({
    user,
    className = ''
}) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        console.log(user);
        console.log(route('user.destroy', {user: user.id}));
        destroy(route('user.destroy', {user: user.id}), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">アカウントの削除</h2>

                <p className="mt-1 text-sm text-gray-600">
                    アカウントが削除されると、そのすべてのリソースとデータが完全に削除されます。<br />
                    アカウントを削除する場合は、保持したいデータまたは情報をダウンロードしてください。
                </p>
            </header>

            <button className="button delete" onClick={confirmUserDeletion}>アカウントの削除</button>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        アカウントを削除してもよろしいですか？
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                        アカウントが削除されると、そのすべてのリソースとデータが完全に削除されます。<br />
                        パスワードを入力して、アカウントを完全に削除することを確認します。
                    </p>

                    <div className="mt-6">
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button className="button secondary" onClick={closeModal}>キャンセル</button>

                        <button className="button delete ml-3" disabled={processing}>
                            アカウントの削除
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
