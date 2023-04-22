// import React from "react";
import { useNavigate } from "react-router";
import { v1 as uuid } from "uuid";

function CreateRoom() {
  const navigate = useNavigate();
  const create = () => {
    const id = uuid();
    navigate(`/room/${id}`);
  };

  return (
    <div className="flex justify-center items-center mx-auto my-8">
      <button
        className="p-3 shadow-xl drop-shadow-xl	 text-xl bg-red-200/50 font-bold rounded-md w-[250px]"
        onClick={create}
      >
        Create Room
      </button>
    </div>
  );
}

export default CreateRoom;
